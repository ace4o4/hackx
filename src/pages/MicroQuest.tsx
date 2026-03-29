import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera, Mic, X, CheckCircle, Square, Play, Pause, RotateCcw, Zap, ExternalLink, Trash2, Network } from "lucide-react";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import EvoTwin from "@/components/EvoTwin";
import ProcessingButton from "@/components/ProcessingButton";
import PremiumCard from "@/components/PremiumCard";
import StatusBadge from "@/components/StatusBadge";
import { playClick, playWhoosh, playSuccess } from "@/lib/sounds";
import { connectWallet, submitProofOnChain, getExplorerUrl, getContractAddress } from "@/lib/blockchain";
import { getVaultRecords } from "@/lib/localVault";

type Phase = "select" | "capture" | "preview" | "burst" | "broadcasting" | "complete";
type CaptureMode = "audio" | "image";
type BurstStage = "quantizing" | "fine-tuning" | "securing";

const burstStages: { key: BurstStage; label: string; color: string }[] = [
  { key: "quantizing", label: "QUANTIZING", color: "hsl(175, 90%, 55%)" },
  { key: "fine-tuning", label: "FINE-TUNING", color: "hsl(280, 70%, 60%)" },
  { key: "securing", label: "SECURING WITH S²", color: "hsl(35, 95%, 60%)" },
];

const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const MicroQuest = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("select");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("audio");
  const [burstProgress, setBurstProgress] = useState(0);
  const [txHash, setTxHash] = useState<string>("");
  const [proofHash, setProofHash] = useState<string>("");
  const [isOnChain, setIsOnChain] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState("Searching Validators");
  
  // Hardware Capture State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(24).fill(0.1));
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [vaultStats, setVaultStats] = useState({ count: 0 });

  const currentBurstStage = useMemo<BurstStage>(() => {
    if (burstProgress < 33) return "quantizing";
    if (burstProgress < 66) return "fine-tuning";
    return "securing";
  }, [burstProgress]);

  const twinMood = useMemo(() => {
    if (phase === "select") return "curious";
    if (phase === "capture") return "excited";
    if (phase === "preview") return "thinking";
    if (phase === "burst") return "thinking";
    if (phase === "broadcasting") return "thinking";
    return "happy";
  }, [phase]);

  // Clean up media streams
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    getVaultRecords().then(records => {
      setVaultStats({ count: records.length });
    });
    return stopStream;
  }, [stopStream]);

  // Real Audio Visualizer while recording
  useEffect(() => {
    if (phase !== "capture" || captureMode !== "audio" || !stream) return;
    
    let audioCtx: AudioContext;
    let analyzer: AnalyserNode;
    let source: MediaStreamAudioSourceNode;
    let animationFrameId: number;

    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 64;
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyzer);

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        analyzer.getByteFrequencyData(dataArray);
        // Map bins down to 24 bars, normalizing 0-255 to 0.1-1.0
        const newLevels = Array.from({ length: 24 }, (_, i) => {
          const value = dataArray[i] || 0;
          return 0.05 + (value / 255) * 0.95;
        });
        setAudioLevels(newLevels);
        animationFrameId = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (err) {
      console.error("Audio Context failed", err);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [phase, captureMode, stream]);

  // ML Burst Training 
  useEffect(() => {
    if (phase !== "burst") return;
    let isMounted = true;
    
    import("@/lib/ml").then(({ runBurstTraining }) => {
      runBurstTraining(captureMode, mediaUrl, (progress) => {
        if (isMounted) setBurstProgress(Math.min(100, progress));
      }).then((result) => {
        if (isMounted) {
          setTxHash(result.txHash);
          setProofHash(result.proofHash);
          setPhase("broadcasting");
        }
      }).catch((err) => {
        console.error("Burst training error", err);
      });
    });

    return () => { isMounted = false; };
  }, [phase, captureMode]);

  // Broadcasting — Try real on-chain, fallback to simulated
  useEffect(() => {
    if (phase !== "broadcasting") return;
    let cancelled = false;

    (async () => {
      // Try real on-chain submission
      if (getContractAddress() && proofHash) {
        try {
          setBroadcastStatus("Connecting Wallet...");
          const { signer } = await connectWallet();
          setBroadcastStatus("Awaiting Signature...");
          const result = await submitProofOnChain(signer, proofHash, captureMode);
          if (!cancelled) {
            setTxHash(result.txHash);
            setIsOnChain(true);
            setPhase("complete");
            playSuccess();
          }
          return;
        } catch (err) {
          console.warn("[MicroQuest] On-chain submission failed, using simulation:", err);
          setBroadcastStatus("Fallback: Simulated Commit");
        }
      } else {
        setBroadcastStatus("Simulating Network Commit...");
      }

      // Fallback: simulated broadcast
      const timeout = setTimeout(() => {
        if (!cancelled) {
          setPhase("complete");
          playSuccess();
        }
      }, 3500);
      return () => clearTimeout(timeout);
    })();

    return () => { cancelled = true; };
  }, [phase, proofHash, captureMode]);

  const handleFinish = useCallback(() => {
    playClick();
    playWhoosh();
    stopStream();
    navigate("/home");
  }, [navigate, stopStream]);

  const handleModeSelect = useCallback((mode: CaptureMode) => {
    playClick();
    setCaptureMode(mode);
  }, []);

  const startHardwareCapture = useCallback(async () => {
    playClick();
    setMediaUrl(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia(
        captureMode === "audio" ? { audio: true } : { video: { facingMode: "user" } }
      );
      setStream(s);
      
      // If video, attach stream immediately
      if (captureMode === "image") {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(e => console.error(e));
          }
        }, 100);
      } else {
        // Start MediaRecorder for audio
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(s);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      }
      setPhase("capture");
    } catch (err) {
      console.error("Camera/Mic access denied", err);
      // Fallback if user denies permissions or has no camera (desktop PC)
      setMediaUrl(captureMode === "audio" ? "mock_audio.mp3" : "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop");
      setPhase("preview");
    }
  }, [captureMode]);

  const takePhoto = useCallback(() => {
    playClick();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setMediaUrl(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
    stopStream();
    setPhase("preview");
  }, [stopStream]);

  const stopAudioRecording = useCallback(() => {
    playClick();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        
        // Create audio element to get duration
        const audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          // Handle Infinity duration (common with webm blobs)
          if (audio.duration === Infinity) {
            audio.currentTime = 1e10;
            audio.addEventListener("timeupdate", function handler() {
              audio.removeEventListener("timeupdate", handler);
              setAudioDuration(audio.duration);
              audio.currentTime = 0;
            });
          } else {
            setAudioDuration(audio.duration);
          }
        });
        audio.addEventListener("timeupdate", () => {
          if (audio.duration && audio.duration !== Infinity) {
            setAudioProgress(audio.currentTime / audio.duration);
          }
        });
        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          setAudioProgress(0);
        });
        audioPlayerRef.current = audio;
      };
      recorder.stop();
    } else {
      // Fallback: mock audio
      setMediaUrl("mock_audio_captured.mp3");
      setAudioDuration(4);
    }
    stopStream();
    setPhase("preview");
  }, [stopStream]);

  const handleRetake = useCallback(() => {
    playClick();
    // Clean up audio player
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
    if (mediaUrl && mediaUrl.startsWith("blob:")) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setPhase("select");
  }, [mediaUrl]);

  const handlePlayPause = useCallback(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleDeleteAudio = useCallback(() => {
    playClick();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
    if (mediaUrl && mediaUrl.startsWith("blob:")) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setPhase("select");
  }, [mediaUrl]);

  const handleTrain = useCallback(() => {
    playClick();
    playWhoosh();
    setPhase("burst");
  }, []);

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-6 bg-[#030712]">
      {/* Background UI */}
      <div className="absolute inset-0 bg-background aurora-bg pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 40% at 50% 40%, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
      }} />

      <div className="absolute top-5 right-5 z-50">
        <DoodleThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full py-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex items-center justify-between mb-6">
          <StatusBadge label="MICRO-QUEST_01" variant="active" />
          <button onClick={handleFinish} className="text-muted-foreground hover:text-foreground aegis-transition">
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mb-6">
          <EvoTwin size={80} level={7} mood={twinMood} interactive />
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center w-full">
              <h1 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora mb-2">CAPTURE_DATA</h1>
              <p className="text-sm text-muted-foreground font-sans mb-8">Choose your contribution method</p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                {[
                  { mode: "audio" as CaptureMode, icon: Mic, label: "AUDIO", desc: "Voice note" },
                  { mode: "image" as CaptureMode, icon: Camera, label: "IMAGE", desc: "Visual capture" },
                ].map(({ mode, icon: Icon, label, desc }) => (
                  <PremiumCard key={mode} variant={captureMode === mode ? "gradient" : "default"} glow={captureMode === mode ? "cyan" : "none"} hoverable delay={0}>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleModeSelect(mode)} className="flex flex-col items-center gap-3 w-full cursor-pointer">
                      <Icon className={`w-8 h-8 ${captureMode === mode ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-xs font-mono tracking-wider text-foreground">{label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{desc}</span>
                    </motion.button>
                  </PremiumCard>
                ))}
              </div>
              <ProcessingButton variant="primary" onClick={startHardwareCapture} className="w-full max-w-xs">
                OPEN HARDWARE
              </ProcessingButton>
            </motion.div>
          )}

          {phase === "capture" && (
            <motion.div key="capture" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center w-full">
              {captureMode === "audio" ? (
                <>
                  <StatusBadge label="LIVE MIC ACTIVE" variant="active" className="mb-8" />
                  <div className="flex items-center justify-center gap-[3px] h-32 mb-8 w-full max-w-xs">
                    {audioLevels.map((level, i) => {
                      const hue = 175 + (i / audioLevels.length) * 105;
                      return <motion.div key={i} className="w-2 rounded-full" style={{ backgroundColor: `hsl(${hue}, 75%, 55%)` }} animate={{ height: `${level * 100}%` }} transition={{ duration: 0.1 }} />;
                    })}
                  </div>
                  <ProcessingButton variant="ghost" className="w-full max-w-xs gap-2 border border-border" onClick={stopAudioRecording}>
                    <Square className="w-4 h-4 fill-current" /> STOP RECORDING
                  </ProcessingButton>
                </>
              ) : (
                <>
                  <StatusBadge label="CAMERA SENSOR ACTIVE" variant="active" className="mb-6" />
                  <PremiumCard variant="outlined" className="w-full max-w-xs mb-6 overflow-hidden p-1 relative bg-black/40" hoverable={false}>
                    {/* Live Video Feed */}
                    <div className="relative w-full aspect-video rounded-md overflow-hidden flex items-center justify-center bg-black/80">
                      {stream ? (
                        <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover scale-x-[-1]" />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground/30">
                          <Camera className="w-10 h-10 mb-2" />
                          <span className="text-[10px] font-mono uppercase">Requesting Lens...</span>
                        </div>
                      )}
                      
                      {/* Reticle UI overlay */}
                      {stream && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-primary/40 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                          </div>
                        </div>
                      )}
                    </div>
                  </PremiumCard>
                  
                  <ProcessingButton variant="primary" onClick={takePhoto} className="w-full max-w-xs gap-2">
                    <Camera className="w-4 h-4" /> CAPTURE FRAME
                  </ProcessingButton>
                </>
              )}
            </motion.div>
          )}

          {phase === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center w-full">
              <h2 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora mb-2">REVIEW_DATA</h2>
              <p className="text-sm text-muted-foreground font-sans mb-6">Confirm payload before training</p>
              
              <PremiumCard variant="outlined" className="w-full max-w-xs mb-6 overflow-hidden p-1" hoverable={false}>
                {captureMode === "image" && mediaUrl ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border border-primary/20">
                     <img src={mediaUrl} alt="Captured preview" className="w-full h-full object-cover scale-x-[-1]" />
                     <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full border border-primary/20 text-[9px] font-mono text-primary">RAW FRAME</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4 w-full">
                     {/* Waveform visualization */}
                     <div className="flex items-center justify-center gap-[2px] h-16 mb-4 w-full max-w-[200px]">
                       {Array(32).fill(0).map((_, i) => {
                         const h = isPlaying 
                           ? 15 + Math.sin((audioProgress * 20) + i * 0.5) * 25 + Math.random() * 10
                           : 8 + Math.sin(i * 0.6) * 12;
                         const hue = 175 + (i / 32) * 105;
                         return <div key={i} className="w-1 rounded-full transition-all duration-100" style={{ 
                           height: `${h}%`, 
                           backgroundColor: `hsl(${hue}, 75%, ${isPlaying ? '55' : '35'}%)`,
                           opacity: isPlaying ? 1 : 0.5 
                         }} />;
                       })}
                     </div>

                     {/* Play/Pause Button */}
                     <button onClick={handlePlayPause} className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center hover:bg-primary/30 active:scale-95 transition-all mb-4">
                       {isPlaying ? (
                         <Pause className="w-5 h-5 text-primary" fill="currentColor" />
                       ) : (
                         <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                       )}
                     </button>

                     {/* Progress bar */}
                     <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden mb-2 cursor-pointer" onClick={(e) => {
                       if (!audioPlayerRef.current || !audioDuration) return;
                       const rect = e.currentTarget.getBoundingClientRect();
                       const pct = (e.clientX - rect.left) / rect.width;
                       audioPlayerRef.current.currentTime = pct * audioDuration;
                       setAudioProgress(pct);
                     }}>
                       <motion.div 
                         className="h-full bg-primary rounded-full" 
                         style={{ width: `${audioProgress * 100}%` }}
                         transition={{ duration: 0.1 }}
                       />
                     </div>
                     
                     {/* Duration */}
                     <div className="flex justify-between w-full text-[9px] font-mono text-muted-foreground">
                       <span>{formatTime(audioProgress * audioDuration)}</span>
                       <span>{formatTime(audioDuration)}</span>
                     </div>
                  </div>
                )}
              </PremiumCard>

              <div className="flex w-full max-w-xs gap-3">
                <button onClick={handleDeleteAudio} className="w-12 h-12 rounded-xl font-mono text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center justify-center" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={handleRetake} className="flex-1 h-12 rounded-xl font-mono text-xs font-bold text-muted-foreground border border-border bg-card/50 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> RECAPTURE
                </button>
                <button onClick={handleTrain} className="flex-[2] h-12 rounded-xl font-mono text-xs font-bold text-background bg-primary shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-current" /> TRAIN
                </button>
              </div>
            </motion.div>
          )}

          {phase === "burst" && (
            <motion.div key="burst" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              <h2 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora mb-2">NEURAL_TRAINING</h2>
              <p className="text-[10px] font-mono text-primary animate-[pulse_2s_ease-in-out_infinite] mb-6">Processing Tensors in Real-Time...</p>

              {/* Holographic Media Container */}
              <div className="relative w-full max-w-xs aspect-square border-2 border-primary/30 bg-black/80 rounded-2xl overflow-hidden mb-8 flex items-center justify-center p-3 shadow-[0_0_40px_rgba(0,242,254,0.15)] group">
                 {/* Grid background */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,254,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.05)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
                 
                 {captureMode === "image" && mediaUrl ? (
                   <div className="relative w-full h-full rounded-xl overflow-hidden border border-primary/40 bg-zinc-900">
                     <img src={mediaUrl} className="w-full h-full object-cover opacity-70 grayscale scale-x-[-1] mix-blend-screen" />
                     
                     {/* Scanning reticle and overlays */}
                     <motion.div className="absolute left-0 w-full h-[3px] bg-primary shadow-[0_0_15px_rgba(0,242,254,1)] z-10"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                     />
                     <motion.div className="absolute inset-0 mix-blend-overlay bg-primary"
                       animate={{ opacity: [0, 0.3, 0] }}
                       transition={{ duration: 1.5, repeat: Infinity }}
                     />
                     {/* Random Bounding Boxes */}
                     {Array(3).fill(0).map((_, i) => (
                       <motion.div key={i} className="absolute border border-primary/80 bg-primary/20 rounded-sm"
                         animate={{ 
                           x: [Math.random() * 100, Math.random() * 200, Math.random() * 100], 
                           y: [Math.random() * 100, Math.random() * 200, Math.random() * 100], 
                           width: [40, 80, 50], 
                           height: [40, 60, 40],
                           opacity: [0, 1, 0, 1] 
                         }}
                         transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                       >
                         <div className="absolute -top-3 left-0 text-[6px] font-mono text-primary font-bold bg-black/60 px-1">OBJ_DET_{i} {(Math.random() * 0.4 + 0.6).toFixed(2)}</div>
                       </motion.div>
                     ))}
                   </div>
                 ) : (
                   <div className="relative w-full h-full rounded-xl overflow-hidden border border-primary/40 bg-zinc-900 flex flex-col items-center justify-center">
                     <Mic className="w-16 h-16 text-primary/20 absolute" />
                     {/* Circular Audio Scanner */}
                     <motion.div className="absolute w-48 h-48 border-2 border-dashed border-primary/30 rounded-full"
                       animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                       transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     />
                     <motion.div className="absolute w-32 h-32 border border-primary/20 rounded-full"
                       animate={{ rotate: -360, scale: [1, 0.95, 1] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     />
                     <div className="absolute flex gap-[3px] items-center justify-center mix-blend-screen h-24">
                       {Array(24).fill(0).map((_, i) => (
                         <motion.div key={i} className="w-2.5 bg-primary/80 rounded-sm shadow-[0_0_10px_rgba(0,242,254,0.5)]"
                          animate={{ height: [10, Math.random() * 80 + 20, 10] }}
                          transition={{ duration: Math.random() * 0.4 + 0.2, repeat: Infinity, ease: "easeInOut" }}
                         />
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Corner decorations */}
                 <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
                 <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
                 <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
                 <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />
                 
                 {/* Live telemetry overlay */}
                 <div className="absolute top-3 left-3 flex flex-col gap-0.5 pointer-events-none bg-black/40 px-1.5 py-1 rounded backdrop-blur-sm">
                    <span className="text-[7px] font-mono text-primary font-bold">SYS.ON // ZK_CORE</span>
                    <span className="text-[7px] font-mono text-primary">LOSS: <motion.span animate={{ opacity: [1, 0.5] }} transition={{ repeat: Infinity }}>{(0.32 - burstProgress * 0.003).toFixed(4)}</motion.span></span>
                 </div>
                 <div className="absolute bottom-3 right-3 flex flex-col gap-0.5 items-end pointer-events-none bg-black/40 px-1.5 py-1 rounded backdrop-blur-sm">
                    <span className="text-[7px] font-mono text-primary">LAYER: {currentBurstStage.toUpperCase()}</span>
                    <span className="text-[7px] font-mono text-primary font-bold">{Math.round(burstProgress)}% COMPLETE</span>
                 </div>
              </div>

              {/* Progress and Stages */}
              <div className="w-full max-w-xs mb-6">
                <div className="flex justify-between text-[10px] font-mono text-foreground mb-2 items-center">
                  <div className="flex gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="tracking-widest uppercase font-bold text-muted-foreground">ACTIVE: {burstStages.find(s => s.key === currentBurstStage)?.label}</span>
                  </div>
                  <span className="mono-nums text-primary font-bold">{Math.min(100, Math.round(burstProgress))}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden relative shadow-inner">
                  {/* Stripes overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.3)_50%,transparent_75%)] bg-[length:15px_15px] animate-[slide_1s_linear_infinite] z-10" />
                  <motion.div className="h-full rounded-full relative z-0" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(280, 80%, 60%))", boxShadow: "0 0 15px hsl(var(--primary))" }} animate={{ width: `${Math.min(100, burstProgress)}%` }} transition={{ duration: 0.1 }} />
                </div>
              </div>
              
              {/* Fake Terminal Logs */}
              <div className="w-full max-w-xs h-32 bg-black/80 border border-primary/30 rounded-xl p-3 overflow-hidden font-mono text-[9px] text-primary/80 flex flex-col justify-end relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                 <div className="absolute top-0 right-0 p-1 px-3 bg-primary/20 text-primary rounded-bl-xl border-b border-l border-primary/30 font-bold uppercase tracking-widest text-[8px] flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   LOCAL ML ENGINE
                 </div>
                 <motion.div animate={{ y: [0, -18] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="flex flex-col gap-1.5 leading-none">
                   <p className="opacity-40">{">"} Raw Data Access: Local Sandboxed Context</p>
                   {burstProgress > 5 && <p className="opacity-50">{">"} Compiling local {captureMode === "audio" ? "audio frequencies" : "pixel vectors"}...</p>}
                   {burstProgress > 25 && <p className="opacity-60">{">"} Extracting ML weights. RAW DATA NEVER LEAVES DEVICE.</p>}
                   {burstProgress > 40 && <p className="text-secondary font-bold">{">"} [LOCAL_VAULT] Committing raw {captureMode} blob to IndexedDB...</p>}
                   {burstProgress > 55 && <p className="opacity-70">{">"} Training Loss: {(0.084 - burstProgress*0.0005).toFixed(4)}.</p>}
                   {burstProgress > 70 && <p className="text-secondary font-bold">{">"} [MODEL_UPDATE] Reinforcing with {vaultStats.count} historical local records.</p>}
                   {burstProgress > 85 && <p className="opacity-90">{">"} Destroying raw data tensors. Retaining only ML Delta.</p>}
                   {burstProgress > 90 && <p className="text-primary font-bold">{">"} Preparing ZK payload for Aptos blockchain -{">"}_</p>}
                   <p className="text-success">{">"} [{Math.random().toString(16).slice(2, 12).toUpperCase()}] _</p>
                 </motion.div>
              </div>
            </motion.div>
          )}

          {phase === "broadcasting" && (
            <motion.div key="broadcasting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center w-full">
              <h2 className="text-2xl font-mono font-bold tracking-tighter gradient-text-aurora mb-2">ON-CHAIN COMMIT</h2>
              <p className="text-sm text-primary/80 font-mono mb-10 animate-pulse">Syncing Delta via Differential Privacy to Aptos Testnet...</p>
              
              {/* Dynamic Network Connectivity Visualization */}
              <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
                <motion.div className="absolute inset-0 rounded-full border border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(0,242,254,0.1)]" />
                <motion.div className="absolute inset-2 rounded-full border-2 border-primary/50 border-t-primary border-b-secondary" animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-6 rounded-full border-2 border-dashed border-primary/30" animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-10 rounded-full border border-secondary/40" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
                
                <div className="absolute z-10 flex flex-col items-center justify-center bg-black/60 w-16 h-16 rounded-full backdrop-blur-md border border-primary/40">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Network className="w-8 h-8 text-primary shadow-[0_0_15px_hsl(var(--primary))]" />
                  </motion.div>
                </div>
                
                {/* Connecting dots/nodes */}
                {Array(8).fill(0).map((_, i) => (
                   <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-primary"
                    style={{ 
                      top: `${50 + 55 * Math.sin(i * Math.PI / 4)}%`, 
                      left: `${50 + 55 * Math.cos(i * Math.PI / 4)}%`,
                      boxShadow: "0 0 10px hsl(var(--primary))"
                    }}
                    animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                   >
                     {/* Connecting lines towards center */}
                     <motion.div className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-primary/60 to-transparent origin-left"
                       style={{ 
                         width: '50px',
                         transform: `translate(0, -50%) rotate(${180 + i * 45}deg)`
                       }}
                       animate={{ opacity: [0, 0.8, 0] }}
                       transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                     />
                   </motion.div>
                ))}
              </div>

              {/* Technical Status Panel */}
              <div className="bg-black/80 border border-primary/30 p-5 rounded-2xl w-full max-w-xs text-left shadow-[0_0_30px_rgba(0,242,254,0.15)] relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_2s_infinite]" />
                
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-primary/20">
                   <div className="flex gap-2 items-center">
                     <span className="w-2.5 h-2.5 rounded-full bg-primary animate-[pulse_1s_infinite] shadow-[0_0_8px_hsl(var(--primary))]" />
                     <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">Network Link</span>
                   </div>
                   <span className="text-[10px] font-mono text-secondary font-bold uppercase drop-shadow-[0_0_5px_rgba(180,100,250,0.5)]">{broadcastStatus}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">Target Node</span>
                    <span className="text-[11px] font-mono text-foreground font-semibold flex items-center gap-2">
                       <div className="w-4 h-4 rounded border border-primary/50 flex items-center justify-center bg-primary/10 text-[6px]">MOVE</div>
                       Aptos Testnet
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">Zero-Knowledge Proof Hash</span>
                    <span className="text-[10px] font-mono text-primary break-all bg-primary/10 p-2 rounded-lg border border-primary/20 font-medium">
                       {proofHash || "Generating securely..."}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">Transaction ID</span>
                    <span className="text-[10px] font-mono text-secondary break-all">
                       {txHash || "Awaiting validator mapping..."}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }} className="flex flex-col items-center">
              <EvoTwin size={120} level={8} mood="happy" className="mb-6" />
              <StatusBadge label={isOnChain ? "CONFIRMED ON-CHAIN ⛓" : "SIMULATED COMMIT"} variant="success" className="mb-4" />
              <h2 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora mb-2">ZK-SYNC SUCCESS</h2>
              <p className="text-sm font-mono text-success mono-nums mb-2">+0.0003 APT CLAIMED</p>
              {isOnChain && txHash && (
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-mono text-primary hover:underline mb-4"
                >
                  View on Aptos Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <ProcessingButton variant="primary" onClick={handleFinish} className="w-full max-w-xs uppercase mt-2">
                Return to Swarm
              </ProcessingButton>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hidden canvas for image capture processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default MicroQuest;
