import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface AudioPlayerProps {
  src: string;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
type SpeedOption = (typeof SPEED_OPTIONS)[number];

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<SpeedOption>(1);

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    // In case metadata already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const handleSpeedChange = useCallback((s: SpeedOption) => {
    setSpeed(s);
    if (audioRef.current) {
      audioRef.current.playbackRate = s;
    }
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, ratio));
    audio.currentTime = clamped * duration;
  }, [duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Container styles
  const containerBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const containerBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  // Speed button active bg
  const activeSpeedBg = isDark ? 'rgba(8,255,0,0.08)' : 'rgba(93,63,211,0.06)';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        background: containerBg,
        border: `1px solid ${containerBorder}`,
        borderRadius: '4px',
      }}
    >
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <IconButton
        onClick={togglePlay}
        size="small"
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          backgroundColor: primary,
          color: isDark ? '#000' : '#fff',
          '&:hover': {
            backgroundColor: primary,
            opacity: 0.88,
          },
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>

      {/* Progress + Time */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* Progress bar */}
        <Box
          ref={progressRef}
          onClick={handleProgressClick}
          sx={{
            position: 'relative',
            width: '100%',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress}%`,
              borderRadius: '2px',
              backgroundColor: primary,
              transition: 'width 0.1s linear',
            }}
          />
        </Box>

        {/* Time display */}
        <Typography
          sx={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '11px',
            lineHeight: 1,
            color: theme.palette.text.secondary,
            userSelect: 'none',
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>

      {/* Speed controls */}
      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
        {SPEED_OPTIONS.map((s) => {
          const isActive = speed === s;
          return (
            <Box
              key={s}
              component="button"
              onClick={() => handleSpeedChange(s)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 24,
                border: `1px solid ${isActive ? primary : containerBorder}`,
                borderRadius: '3px',
                background: isActive ? activeSpeedBg : 'transparent',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'Space Mono, monospace',
                fontSize: '11px',
                color: isActive ? primary : theme.palette.text.secondary,
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                '&:hover': {
                  borderColor: primary,
                  color: primary,
                },
              }}
              aria-label={`Set speed to ${s}x`}
              aria-pressed={isActive}
            >
              {s}x
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AudioPlayer;
