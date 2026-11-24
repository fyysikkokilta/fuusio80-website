const messages = {
  mainNavigation: {
    menu: 'Päävalikko',
    openMenu: 'Avaa valikko',
    closeMenu: 'Sulje valikko',
    showMenu: 'Näytä päävalikko'
  },
  tableOfContents: {
    toggle: 'Avaa/sulje sisällysluettelo'
  },
  footer: {
    copyright: '© {year} Fyysikkokilta ry'
  },
  calendar: {
    today: 'Tänään',
    month: 'Kuukausi',
    week: 'Viikko',
    day: 'Päivä',
    agenda: 'Agenda',
    date: 'Päivämäärä',
    time: 'Aika',
    event: 'Tapahtuma',
    allDay: 'Koko päivä',
    workWeek: 'Työviikko',
    previous: 'Edellinen',
    next: 'Seuraava',
    yesterday: 'Eilen',
    tomorrow: 'Huomenna',
    noEventsInRange: 'Ei tapahtumia tällä aikavälillä',
    more: 'lisää'
  },
  events: {
    title: 'Tapahtumat',
    upcoming: 'Tulevat tapahtumat',
    past: 'Menneet tapahtumat',
    noEvents: 'Tapahtumia ei ole vielä julkaistu.',
    noUpcoming: 'Ei tulevia tapahtumia.',
    signup: 'Ilmoittaudu',
    moreInfo: 'Lisätiedot',
    signupOpens: 'Ilmoittautuminen aukeaa {date}',
    signupClosed: 'Ilmoittautuminen on päättynyt'
  },
  rotatablePlane: {
    label: 'Käännettävä kuva',
    hint: 'Käännä kuva toisin päin vetämällä sivusuunnassa. Voit myös klikata, painaa Enter-näppäintä tai käyttää vasenta ja oikeaa nuolinäppäintä.'
  },
  pdfViewer: {
    openInNewTab: 'Avaa uudessa välilehdessä',
    fallbackMessage:
      'Selaimesi ei tue PDF-tiedostojen upottamista. Voit ladata PDF-tiedoston avaamalla sen uudessa välilehdessä.',
    selectDocument: 'Valitse dokumentti'
  },
  draftMode: {
    preview: 'Tämä on luonnoksen esikatselu'
  },
  common: {
    noImage: 'Ei kuvaa',
    defaultImage: 'Oletuskuva'
  },
  notFound: {
    meta: {
      title: 'Sivua ei löydy',
      description:
        'Etsimääsi sivua ei ole olemassa. Palaa takaisin etusivullemme tutustuaksesi Fyysikkokiltaan.'
    },
    logoAlt: 'Fyysikkokillan logo',
    title: 'Herra, on vaikea olla nöyrä...',
    description:
      'Kun on täydellinen kaikin puolin. En voi odottaa pääseväni katsomaan peiliin, koska näytän joka päivä paremmalta. Tuntea minut on rakastaa minua, olen varmasti helvetin mies. Herra, on vaikea olla nöyrä, mutta teen parhaani.',
    subtitle: 'Mutta tämä sivu? Ei löydy. Jopa täydellisyydellä on rajansa!',
    goHome: 'Mene kotiin ja ihaile itseäsi'
  },
  globalError: {
    title: 'Jotain meni pieleen',
    description: 'Pahoittelut, odottamaton virhe on tapahtunut.',
    contactInfo: 'Jos ongelma jatkuu, ota yhteyttä viestintävastaavaan.',
    tryAgain: 'Yritä uudelleen',
    goHome: 'Mene kotiin',
    logoAlt: 'Fyysikkokillan logo'
  },
  partners: {
    title: 'Yhteistyökumppanit'
  },
  languageSwitcher: {
    label: 'Kieli',
    switchLanguage: 'Vaihda kieli englanniksi'
  },
  skipLink: 'Siirry pääsisältöön'
} as const

export default messages
