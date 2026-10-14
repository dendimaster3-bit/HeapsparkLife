import type { TranslationKey } from './en';

/**
 * Kreol Morisien. Missing keys fall back to English.
 * NOTE: draft translations — please have a native speaker review.
 */
export const mfe: Partial<Record<TranslationKey, string>> = {
  'intro.tagline': 'Explor enn Moris 3D, dekouver bann biznes lokal ek debloke vre promosion.',
  'intro.start': 'Anou explore',
  'intro.loading': 'Pe sarz lil la…',
  'intro.sponsor': 'Met ou piblisite isi — heapspark.com/advertise',
  'intro.sponsorLabel': 'Prezante par',
  'nav.island': 'Moris',
  'nav.back': 'Retourne',
  'nav.zoomOut': 'Get pli lwin',
  'nav.districts': 'Distrik',
  'nav.towns': 'Lavil ek vilaz',
  'nav.enter': 'Explor {name}',
  'nav.close': 'Ferme',
  'hud.day': 'Lazourne',
  'hud.night': 'Aswar',
  'hud.timeLabel': 'Ler Moris',
  'hud.controls': 'Glis pou bouze · Pins pou zoom · De ledwa pou tourne',
  'settings.title': 'Reglaz',
  'settings.theme': 'Tem',
  'settings.theme.system': 'Oto',
  'settings.theme.light': 'Kler',
  'settings.theme.dark': 'Nwar',
  'settings.language': 'Lang',
  'legal.pointsNotMoney': 'Spark Points se zis pou zwe — se pa kas e zot pa kapav sanz zot pou larzan.',
  'legal.demo': 'Bann biznes ki ou trouve isi se bann egzanp.',
  'debug.realTime': 'Ler reel',
};
