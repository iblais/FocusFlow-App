'use client';

/**
 * Quick Capture System
 * Voice-to-task, photo-to-task, and natural language processing
 * for ADHD-friendly rapid task entry
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Camera,
  Keyboard,
  Send,
  X,
  Loader2,
  Sparkles,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/design/GlassCard';
import { tasksDB } from '@/lib/db/tasks-db';
import type { QuickCapture, VoiceTaskData, PhotoTaskData } from '@/types/adhd-task-system';

interface QuickCaptureProps {
  userId: string;
  onTaskCreated?: (taskId: string) => void;
  onClose?: () => void;
}

type CaptureMode = 'voice' | 'photo' | 'text';

export function QuickCaptureWidget({ userId, onTaskCreated, onClose }: QuickCaptureProps) {
  const [mode, setMode] = useState<CaptureMode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [voiceData, setVoiceData] = useState<VoiceTaskData | null>(null);
  const [photoData, setPhotoData] = useState<PhotoTaskData | null>(null);
  const [parsedTask, setParsedTask] = useState<Partial<QuickCapture> | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup media streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ===== VOICE CAPTURE =====

  const startVoiceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceCapture(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start voice recording:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopVoiceCapture = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceCapture = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Send to API for transcription and parsing
        const response = await fetch('/api/ai/voice-to-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Audio,
            userId,
          }),
        });

        if (response.ok) {
          const data: VoiceTaskData = await response.json();
          setVoiceData(data);

          // Create quick capture record
          const capture: Partial<QuickCapture> = {
            userId,
            captureMethod: 'voice',
            rawContent: data.transcript,
            parsedTitle: data.parsedIntent.taskTitle,
            parsedDueDate: data.parsedIntent.dueDate,
            parsedTags: data.parsedIntent.tags || [],
            parsedPriority: data.parsedIntent.priority,
            processed: false,
            convertedToTask: false,
            capturedAt: new Date(),
          };

          setParsedTask(capture);
        } else {
          throw new Error('Failed to process voice capture');
        }
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== PHOTO CAPTURE =====

  const startPhotoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      await processPhotoCapture(blob);
    }, 'image/jpeg');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processPhotoCapture(file);
  };

  const processPhotoCapture = async (imageBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);

      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        // Send to API for OCR and parsing
        const response = await fetch('/api/ai/photo-to-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            userId,
          }),
        });

        if (response.ok) {
          const data: PhotoTaskData = await response.json();
          setPhotoData(data);

          // Create quick capture record from first detected task
          const firstTask = data.suggestedTasks[0];
          if (firstTask) {
            const capture: Partial<QuickCapture> = {
              userId,
              captureMethod: 'photo',
              rawContent: data.ocrText,
              mediaUrl: base64Image,
              parsedTitle: firstTask.title,
              parsedTags: [],
              processed: false,
              convertedToTask: false,
              capturedAt: new Date(),
            };

            setParsedTask(capture);
          }
        } else {
          throw new Error('Failed to process photo');
        }
      };
    } catch (error) {
      console.error('Photo processing error:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== TEXT CAPTURE =====

  const processTextCapture = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);

    try {
      // Send to API for NLP parsing
      const response = await fetch('/api/ai/parse-text-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput,
          userId,
        }),
      });

      if (response.ok) {
        const parsed = await response.json();

        const capture: Partial<QuickCapture> = {
          userId,
          captureMethod: 'text',
          rawContent: textInput,
          parsedTitle: parsed.title,
          parsedDescription: parsed.description,
          parsedDueDate: parsed.dueDate,
          parsedTags: parsed.tags || [],
          parsedPriority: parsed.priority,
          processed: false,
          convertedToTask: false,
          capturedAt: new Date(),
        };

        setParsedTask(capture);
      } else {
        throw new Error('Failed to parse text');
      }
    } catch (error) {
      console.error('Text parsing error:', error);
      // Fallback: use raw text as title
      const capture: Partial<QuickCapture> = {
        userId,
        captureMethod: 'text',
        rawContent: textInput,
        parsedTitle: textInput,
        parsedTags: [],
        processed: false,
        convertedToTask: false,
        capturedAt: new Date(),
      };

      setParsedTask(capture);
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== TASK CREATION =====

  const createTask = async () => {
    if (!parsedTask) return;

    setIsProcessing(true);

    try {
      // Create task in database
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parsedTask.parsedTitle,
          description: parsedTask.parsedDescription,
          dueDate: parsedTask.parsedDueDate,
          tags: parsedTask.parsedTags,
          priority: parsedTask.parsedPriority || 5,
          energyLevel: 'MEDIUM',
        }),
      });

      if (response.ok) {
        const task = await response.json();

        // Save quick capture record
        const captureId = `capture-${Date.now()}`;
        await tasksDB.addQuickCapture({
          id: captureId,
          ...parsedTask,
          taskId: task.id,
          convertedToTask: true,
          processed: true,
          processedAt: new Date(),
        } as QuickCapture);

        // Show success
        setShowSuccess(true);
        setTimeout(() => {
          onTaskCreated?.(task.id);
          resetState();
        }, 1500);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Task creation error:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setMode(null);
    setTextInput('');
    setVoiceData(null);
    setPhotoData(null);
    setParsedTask(null);
    setShowSuccess(false);
    onClose?.();
  };

  // ===== RENDER =====

  if (showSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8"
      >
        <div className="bg-green-500 text-white rounded-full p-4 mb-4">
          <Check className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Task Created!</h3>
        <p className="text-gray-600">Your task has been added successfully</p>
      </motion.div>
    );
  }

  if (!mode) {
    return (
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Capture</h3>
        <p className="text-sm text-gray-600 mb-6">Choose how you want to capture your task:</p>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setMode('voice')}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <Mic className="h-8 w-8 text-purple-600" />
            <span className="font-medium">Voice</span>
          </button>

          <button
            onClick={() => setMode('photo')}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <Camera className="h-8 w-8 text-purple-600" />
            <span className="font-medium">Photo</span>
          </button>

          <button
            onClick={() => setMode('text')}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <Keyboard className="h-8 w-8 text-purple-600" />
            <span className="font-medium">Text</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {mode === 'voice' && 'Voice Capture'}
          {mode === 'photo' && 'Photo Capture'}
          {mode === 'text' && 'Text Capture'}
        </h3>
        <Button variant="ghost" size="sm" onClick={resetState}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Voice capture UI */}
      {mode === 'voice' && !parsedTask && (
        <div className="flex flex-col items-center gap-4 py-8">
          <button
            onClick={isRecording ? stopVoiceCapture : startVoiceCapture}
            disabled={isProcessing}
            className={`rounded-full p-8 transition-all ${
              isRecording
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            <Mic className="h-12 w-12 text-white" />
          </button>

          <p className="text-sm text-gray-600">
            {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
          </p>

          {isProcessing && (
            <div className="flex items-center gap-2 text-purple-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing your voice...</span>
            </div>
          )}
        </div>
      )}

      {/* Photo capture UI */}
      {mode === 'photo' && !parsedTask && (
        <div className="space-y-4">
          {!streamRef.current ? (
            <div className="flex flex-col gap-4">
              <Button onClick={startPhotoCapture} className="gap-2">
                <Camera className="h-4 w-4" />
                Open Camera
              </Button>

              <div className="text-center text-sm text-gray-600">or</div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Upload Photo
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <video
                ref={videoRef}
                className="w-full rounded-lg border-2 border-gray-200"
                autoPlay
                playsInline
              />

              <Button onClick={capturePhoto} className="w-full gap-2">
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-purple-600 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing image...</span>
            </div>
          )}
        </div>
      )}

      {/* Text capture UI */}
      {mode === 'text' && !parsedTask && (
        <div className="space-y-4">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type or paste your task... Try: 'Call mom tomorrow at 2pm' or 'Review project proposal by Friday'"
            rows={4}
            className="resize-none"
          />

          <Button
            onClick={processTextCapture}
            disabled={!textInput.trim() || isProcessing}
            className="w-full gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Parse with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Parsed task preview */}
      {parsedTask && (
        <GlassCard variant="medium" className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-600 mb-3">
            <Check className="h-5 w-5" />
            <span className="font-medium">Task Parsed Successfully!</span>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Title</label>
            <Input
              value={parsedTask.parsedTitle || ''}
              onChange={(e) => setParsedTask({ ...parsedTask, parsedTitle: e.target.value })}
              className="mt-1"
            />
          </div>

          {parsedTask.parsedDescription && (
            <div>
              <label className="text-xs font-medium text-gray-600">Description</label>
              <Textarea
                value={parsedTask.parsedDescription}
                onChange={(e) =>
                  setParsedTask({ ...parsedTask, parsedDescription: e.target.value })
                }
                rows={2}
                className="mt-1"
              />
            </div>
          )}

          {parsedTask.parsedDueDate && (
            <div>
              <label className="text-xs font-medium text-gray-600">Due Date</label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(parsedTask.parsedDueDate).toLocaleString()}
              </p>
            </div>
          )}

          {parsedTask.parsedTags && parsedTask.parsedTags.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {parsedTask.parsedTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t">
            <Button variant="outline" onClick={resetState} className="flex-1">
              Cancel
            </Button>
            <Button onClick={createTask} disabled={isProcessing} className="flex-1 gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
