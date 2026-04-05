import Layout from '@theme/Layout';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY_DATES = 'checkin-dates';
const STORAGE_KEY_REWARD = 'weekly-reward-image';

const MOTIVATIONAL_QUOTES = [
  '"Thành công là tổng của những nỗ lực nhỏ, được lặp đi lặp lại ngày qua ngày." — Robert Collier',
  '"Không có con đường tắt nào dẫn đến nơi đáng đến." — Beverly Sills',
  '"Sự kiên trì là chìa khóa duy nhất mở được mọi cánh cửa." — Khuyết danh',
  '"Mỗi ngày học một ít, một năm sẽ biết rất nhiều." — Khuyết danh',
  '"Đầu tư vào bản thân là khoản đầu tư sinh lời cao nhất." — Benjamin Franklin',
  '"Hành trình ngàn dặm bắt đầu từ một bước chân." — Lão Tử',
  '"Học không bao giờ là muộn, và cũng không bao giờ là đủ." — Khuyết danh',
  '"Hôm nay khó, ngày mai sẽ dễ hơn — nếu bạn không bỏ cuộc." — Khuyết danh',
  '"Kỷ luật là cầu nối giữa mục tiêu và thành tựu." — Jim Rohn',
  '"Đừng so sánh với người khác, hãy so sánh với chính mình ngày hôm qua." — Jordan Peterson',
];

interface Milestone {
  days: number;
  label: string;
  icon: string;
}

const MILESTONES: Milestone[] = [
  { days: 7, label: 'Chiến binh tuần', icon: '🔥' },
  { days: 14, label: 'Kiên trì 2 tuần', icon: '⚡' },
  { days: 30, label: 'Huyền thoại tháng', icon: '🏆' },
  { days: 60, label: 'Siêu nhân kỷ luật', icon: '💎' },
];

function getStoredDates(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredRewardImage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_REWARD);
  } catch {
    return null;
  }
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeStats(dates: string[]): {
  total: number;
  currentStreak: number;
  longestStreak: number;
} {
  const total = dates.length;
  if (total === 0) return { total: 0, currentStreak: 0, longestStreak: 0 };

  const sorted = [...dates].sort();
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Current streak: count backwards from today
  const today = formatDateKey(new Date());
  let currentStreak = 0;
  const dateSet = new Set(sorted);
  const cursor = new Date();

  // If today is not checked in, start from yesterday
  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dateSet.has(formatDateKey(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { total, currentStreak, longestStreak };
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function CheckInButton({
  checked,
  onCheckIn,
}: {
  checked: boolean;
  onCheckIn: () => void;
}): ReactNode {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (checked) return;
    setAnimating(true);
    onCheckIn();
    setTimeout(() => setAnimating(false), 800);
  };

  return (
    <button
      className={`checkin-btn ${checked ? 'checkin-btn--done' : ''} ${animating ? 'checkin-btn--animating' : ''}`}
      onClick={handleClick}
      disabled={checked}
    >
      <span className="checkin-btn__icon">{checked ? '✓' : '📝'}</span>
      <span className="checkin-btn__text">
        {checked ? 'Hôm nay đã điểm danh!' : 'Điểm danh hôm nay'}
      </span>
    </button>
  );
}

function StatsCards({
  total,
  currentStreak,
  longestStreak,
}: {
  total: number;
  currentStreak: number;
  longestStreak: number;
}): ReactNode {
  return (
    <div className="checkin-stats">
      <div className="checkin-stat-card">
        <span className="checkin-stat-card__number">{total}</span>
        <span className="checkin-stat-card__label">Tổng ngày</span>
      </div>
      <div className="checkin-stat-card checkin-stat-card--streak">
        <span className="checkin-stat-card__number">{currentStreak}</span>
        <span className="checkin-stat-card__label">Streak hiện tại</span>
      </div>
      <div className="checkin-stat-card">
        <span className="checkin-stat-card__number">{longestStreak}</span>
        <span className="checkin-stat-card__label">Streak dài nhất</span>
      </div>
    </div>
  );
}

function Calendar({
  year,
  month,
  checkedDates,
}: {
  year: number;
  month: number;
  checkedDates: Set<string>;
}): ReactNode {
  const today = formatDateKey(new Date());
  const days = getCalendarDays(year, month);
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  return (
    <div className="checkin-calendar">
      <h3 className="checkin-calendar__title">
        {monthNames[month]} {year}
      </h3>
      <div className="checkin-calendar__grid">
        {dayLabels.map((label) => (
          <div key={label} className="checkin-calendar__header">
            {label}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="checkin-calendar__cell checkin-calendar__cell--empty" />;
          }
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateKey === today;
          const isChecked = checkedDates.has(dateKey);
          const isFuture = dateKey > today;

          return (
            <div
              key={dateKey}
              className={[
                'checkin-calendar__cell',
                isChecked && 'checkin-calendar__cell--checked',
                isToday && 'checkin-calendar__cell--today',
                isFuture && 'checkin-calendar__cell--future',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Rewards({ currentStreak }: { currentStreak: number }): ReactNode {
  return (
    <div className="checkin-rewards">
      <h3 className="checkin-section-title">Phần thưởng Milestones</h3>
      <div className="checkin-rewards__grid">
        {MILESTONES.map((m) => {
          const achieved = currentStreak >= m.days;
          const progress = Math.min(currentStreak / m.days, 1);
          return (
            <div
              key={m.days}
              className={`checkin-reward-card ${achieved ? 'checkin-reward-card--achieved' : ''}`}
            >
              <span className="checkin-reward-card__icon">{m.icon}</span>
              <span className="checkin-reward-card__label">{m.label}</span>
              <span className="checkin-reward-card__days">{m.days} ngày liên tiếp</span>
              <div className="checkin-reward-card__progress">
                <div
                  className="checkin-reward-card__progress-bar"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="checkin-reward-card__status">
                {achieved ? 'Đã đạt!' : `${currentStreak}/${m.days}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyReward({
  rewardImage,
  onImageChange,
  onRemoveImage,
}: {
  rewardImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}): ReactNode {
  return (
    <div className="checkin-weekly-reward">
      <h3 className="checkin-section-title">Phần thưởng tuần</h3>
      <p className="checkin-weekly-reward__hint">
        Upload ảnh phần thưởng bạn muốn nhận khi hoàn thành 7 ngày liên tiếp!
      </p>
      {rewardImage ? (
        <div className="checkin-weekly-reward__preview">
          <img src={rewardImage} alt="Phần thưởng tuần" className="checkin-weekly-reward__image" />
          <button className="checkin-weekly-reward__remove" onClick={onRemoveImage}>
            Xoá ảnh
          </button>
        </div>
      ) : (
        <label className="checkin-weekly-reward__upload">
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            hidden
          />
          <span className="checkin-weekly-reward__upload-icon">📷</span>
          <span>Chọn ảnh phần thưởng</span>
        </label>
      )}
    </div>
  );
}

export default function DiemDanh(): ReactNode {
  const [dates, setDates] = useState<string[]>([]);
  const [rewardImage, setRewardImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDates(getStoredDates());
    setRewardImage(getStoredRewardImage());
    setMounted(true);
  }, []);

  const today = formatDateKey(new Date());
  const checkedToday = dates.includes(today);
  const checkedSet = useMemo(() => new Set(dates), [dates]);
  const stats = useMemo(() => computeStats(dates), [dates]);
  const now = new Date();

  const quote = useMemo(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    [],
  );

  const handleCheckIn = useCallback(() => {
    if (checkedToday) return;
    const updated = [...dates, today];
    setDates(updated);
    localStorage.setItem(STORAGE_KEY_DATES, JSON.stringify(updated));
  }, [checkedToday, dates, today]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setRewardImage(base64);
        localStorage.setItem(STORAGE_KEY_REWARD, base64);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleRemoveImage = useCallback(() => {
    setRewardImage(null);
    localStorage.removeItem(STORAGE_KEY_REWARD);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Điểm danh" description="Điểm danh học tập hàng ngày">
        <div className="checkin-page" />
      </Layout>
    );
  }

  return (
    <Layout title="Điểm danh" description="Điểm danh học tập hàng ngày — tạo thói quen mỗi ngày">
      <div className="checkin-page">
        {/* Hero */}
        <div className="checkin-hero">
          <div className="container">
            <h1 className="checkin-hero__title">Điểm danh hàng ngày</h1>
            <p className="checkin-hero__quote">{quote}</p>
            <CheckInButton checked={checkedToday} onCheckIn={handleCheckIn} />
          </div>
        </div>

        <div className="container">
          {/* Stats */}
          <section className="checkin-section">
            <h3 className="checkin-section-title">Thống kê</h3>
            <StatsCards
              total={stats.total}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
            />
          </section>

          {/* Calendar */}
          <section className="checkin-section">
            <Calendar
              year={now.getFullYear()}
              month={now.getMonth()}
              checkedDates={checkedSet}
            />
          </section>

          {/* Rewards */}
          <section className="checkin-section">
            <Rewards currentStreak={stats.currentStreak} />
          </section>

          {/* Weekly Reward */}
          <section className="checkin-section">
            <WeeklyReward
              rewardImage={rewardImage}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
            />
          </section>
        </div>
      </div>
    </Layout>
  );
}
