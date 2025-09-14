import {Component, ElementRef, ViewChild, OnDestroy, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IonIcon} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {pause, play} from 'ionicons/icons';

@Component({
  selector: 'app-mobile-video',
  imports: [CommonModule, IonIcon],
  templateUrl: './mobile-video.html',
  styleUrl: './mobile-video.scss'
})
export class MobileVideo implements OnDestroy
{
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @Input() videoUrl: any = '/assets/video/1.mp4';

  showPlayButton = true;
  isPlaying = false;
  private hideTimeout: any;

  constructor()
  {
    addIcons({play, pause})
  }

  togglePlay()
  {
    if (this.videoRef.nativeElement.paused)
    {
      this.playVideo();
    } else
    {
      this.pauseVideo();
    }
  }

  playVideo()
  {
    this.videoRef.nativeElement.play();
    this.isPlaying = true;
    this.showPlayButton = true; // Show pause icon
    this.resetHideTimer();
  }

  pauseVideo()
  {
    this.videoRef.nativeElement.pause();
    this.isPlaying = false;
    this.showPlayButton = true; // Show play icon
    this.clearHideTimer();
  }

  onVideoClick()
  {
    this.togglePlay();
    if (this.isPlaying)
    {
      this.resetHideTimer();
    }
  }

  private resetHideTimer()
  {
    this.clearHideTimer();
    this.hideTimeout = setTimeout(() =>
    {
      this.showPlayButton = false;
    }, 2000);
  }

  private clearHideTimer()
  {
    if (this.hideTimeout)
    {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  ngOnDestroy()
  {
    this.clearHideTimer();
  }
}
