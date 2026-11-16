// Academic calendar and campus events for QCU

const d = (y, m, day) => new Date(y, m - 1, day)

export const terms = [
  { 
    id: 'ay2627-1', 
    label: '1st Semester AY 2026–2027', 
    start: d(2026, 8, 10), 
    end: d(2026, 12, 18) 
  },
]

export const events = [
  { 
    id: 'tech-summit', 
    label: 'Tech Summit 2026', 
    start: d(2026, 11, 20), 
    end: d(2026, 11, 26), 
    badge: 'Nov 20–26', 
    tone: 'amber' 
  },
  { 
    id: 'midterm', 
    label: 'Midterm Exam Period', 
    start: d(2026, 12, 7), 
    end: d(2026, 12, 13), 
    badge: 'Dec 7–13', 
    tone: 'indigo' 
  },
]

export const boothHours = '8:00 AM – 6:00 PM'
