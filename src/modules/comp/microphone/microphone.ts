import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TimeFormatPipe} from '../TimeFormatPipe';

@Component({
  selector: 'app-microphone',
  imports: [CommonModule, FormsModule, TimeFormatPipe],
  templateUrl: './microphone.html',
  styleUrl: './microphone.scss'
})
export class Microphone implements OnInit, OnDestroy {
  @ViewChild('audioVisualizer') audioVisualizer!: ElementRef<HTMLCanvasElement>;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;

  recordingState: 'idle' | 'recording' | 'paused' = 'idle';
  audioUrl: string | null = null;
  audioBlob: Blob | null = null;
  recordingTime = 0;
  private timer: any = null;

  constructor() {
  }

  ngOnInit(): void {
    this.checkMicrophonePermission();
  }

  ngOnDestroy(): void {
    this.stopAudioContext();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async checkMicrophonePermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('麦克风权限被拒绝:', error);
      alert('请授予麦克风权限以使用录音功能');
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.audioChunks = [];
      this.recordingState = 'recording';
      this.recordingTime = 0;

      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, {type: 'audio/webm'});
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        stream.getTracks().forEach(track => track.stop());
        this.recordingState = 'idle';
      };

      this.mediaRecorder.start(100);
      this.startTimer();
      this.initAudioVisualizer(stream);
    } catch (error) {
      console.error('开始录音失败:', error);
      alert('无法开始录音，请检查麦克风权限');
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.recordingState === 'recording') {
      this.mediaRecorder.pause();
      this.recordingState = 'paused';
      this.stopTimer();
      this.stopAudioVisualization();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.recordingState === 'paused') {
      this.mediaRecorder.resume();
      this.recordingState = 'recording';
      this.startTimer();
      this.startAudioVisualization();
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.recordingState !== 'idle') {
      this.mediaRecorder.stop();
      this.recordingState = 'idle';
      this.stopTimer();
      this.stopAudioVisualization();
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.recordingTime++;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private initAudioVisualizer(stream: MediaStream): void {
    this.stopAudioContext();

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    source.connect(this.analyser);
    this.analyser.fftSize = 256;

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.startAudioVisualization();
  }

  private startAudioVisualization(): void {
    if (!this.analyser || !this.dataArray) return;

    const canvas = this.audioVisualizer.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw);

      // 创建一个新的 Uint8Array 来避免类型冲突
      const tempArray = new Uint8Array(this.analyser!.frequencyBinCount);
      this.analyser!.getByteFrequencyData(tempArray);

      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      canvasCtx.fillRect(0, 0, width, height);

      const barWidth = (width / tempArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < tempArray.length; i++) {
        barHeight = tempArray[i] / 2;

        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
        canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }

  private stopAudioVisualization(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const canvas = this.audioVisualizer.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private stopAudioContext(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  downloadRecording(): void {
    if (!this.audioBlob) return;

    const url = URL.createObjectURL(this.audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();

    window.setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}