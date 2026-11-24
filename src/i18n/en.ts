const messages = {
  mainNavigation: {
    menu: 'Main navigation menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    showMenu: 'Show main navigation'
  },
  tableOfContents: {
    toggle: 'Toggle table of contents'
  },
  footer: {
    copyright: '© {year} Fyysikkokilta ry'
  },
  calendar: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Time',
    event: 'Event',
    allDay: 'All Day',
    workWeek: 'Work Week',
    previous: 'Previous',
    next: 'Next',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    noEventsInRange: 'No events in this date range',
    more: 'more'
  },
  events: {
    title: 'Events',
    upcoming: 'Upcoming events',
    past: 'Past events',
    noEvents: 'No events have been published yet.',
    noUpcoming: 'No upcoming events.',
    signup: 'Sign up',
    moreInfo: 'More information',
    signupOpens: 'Registration opens {date}',
    signupClosed: 'Registration has ended'
  },
  rotatablePlane: {
    label: 'Rotatable image',
    hint: 'Drag sideways to turn the image over. Click, press Enter, or use the left and right arrow keys to turn it.'
  },
  pdfViewer: {
    openInNewTab: 'Open in new tab',
    fallbackMessage:
      'Your browser does not support embedding PDFs directly. You can download the PDF by opening it in a new tab.',
    selectDocument: 'Select document'
  },
  draftMode: {
    preview: 'This is a draft preview'
  },
  common: {
    noImage: 'No image',
    defaultImage: 'Default image'
  },
  notFound: {
    meta: {
      title: 'Page Not Found',
      description:
        "The page you're looking for doesn't exist. Navigate back to our homepage to explore the Guild of Physics."
    },
    logoAlt: 'Guild of Physics Logo',
    title: "Oh Lord, it's hard to be humble...",
    description:
      "When you're perfect in every way. I can't wait to look in the mirror, cause I get better lookin' each day. To know me is to love me, I must be a hell of a man. Oh Lord, it's hard to be humble, but I'm doin' the best that I can.",
    subtitle: 'But this page? Not found. Even perfection has its limits!',
    goHome: 'Go Home & Admire Yourself'
  },
  globalError: {
    title: 'Something Went Wrong',
    description: "We're sorry, but an unexpected error has occurred.",
    contactInfo: 'If this issue persists, please contact the Communications Officer.',
    tryAgain: 'Try Again',
    goHome: 'Go Home',
    logoAlt: 'Guild of Physics Logo'
  },
  partners: {
    title: 'Partners'
  },
  languageSwitcher: {
    label: 'Language',
    switchLanguage: 'Switch language to Finnish'
  },
  skipLink: 'Skip to main content'
} as const

export default messages
