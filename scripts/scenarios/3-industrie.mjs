import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLediging,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 3,
  label: 'Metaalbewerking Berken — jaarlijks — AFGEKEURD',
  klant: {
    id: 'metaalbewerking-berken',
    bedrijfsnaam: 'Metaalbewerking Berken B.V.',
    adres: 'Berkenlaan 8',
    postcode_plaats: '7202 BL Zutphen',
    contactpersoon: 'J. Berken',
    telefoon: '0575-555 901'
  },
  voorziening: {
    id: 'obas-ns10-productiehal',
    naam: 'OBAS NS-10 productiehal-buiten',
    merk: 'Wavin',
    type_bouwjaar: 'OliePass 10 / 2012',
    ns_klasse: 'II',
    capaciteit_l: 10000,
    mat_opbouw: 'beton',
    inlaat_mm: 200,
    uitlaat_mm: 200
  }
};

export async function run(page) {
  section(`Scenario 3: ${meta.label}`, '🏭');

  step(1, 'Seed klant + voorziening',
       'Industriële klant — grote OBAS NS-10 voor metaalbewerking');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = jaarlijks', '');
  await setInterval(page, 'jaarlijks');

  step(4, 'Sectie 1 invullen', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Regen, 9°C'
  });

  step(5, 'Olielaag 95mm — boven 80% grens',
       'Adviesblok ROOD — directe lediging vereist');
  await fillMeting(page, { olielaag: 95, slib: 88 });
  info('Adviesblok: rood "AFGEKEURD — lediging direct vereist"');

  step(6, 'Functietesten — alarmen werken nog wel', '');
  await fillResultGroup(page, 'functietesten', {
    auto_afsluiter:  { resultaat: 'voldoet', opmerking: '' },
    alarm_olielaag:  { resultaat: 'voldoet', opmerking: 'Alarm geactiveerd door overschrijding' },
    alarm_hoogwater: { resultaat: 'voldoet', opmerking: '' }
  });

  step(7, 'Lediging-blok + BAL-referentie',
       'Wettelijk verplicht bij afkeur — Afvalstroomformulier-referentie meegeven');
  await fillLediging(page, {
    lediging: { obas: 'ja', slibvang: 'ja' },
    bal: {
      verwerker: 'TankRein B.V.',
      afvoerbon: 'BAL-2026-0345',
      euralcode: '13.05.06',
      hoeveelheid_l: 9500
    }
  });

  step(8, 'Foto overzicht + meting "OVER GRENS" + afvalstroomformulier',
       '3 foto\'s — overzicht + rode meting + BAL-formulier');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-10', sublabel: 'productiehal Berken', status: 'neutraal'
  }));
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 95mm', sublabel: 'OVER GRENSWAARDE', status: 'defect'
  }));
  await injectFoto(page, 'afvalstroomformulier', svgPhoto({
    label: 'BAL-2026-0345', sublabel: 'TankRein B.V., 9500 L', status: 'neutraal'
  }));

  step(9, 'Eindoordeel = AFGEKEURD',
       'Hercontrole binnen 4 weken — bewijs van lediging vereist');
  const hercontrole = new Date();
  hercontrole.setDate(hercontrole.getDate() + 28);
  await setEindoordeel(page, 'afgekeurd',
    'Olielaagdikte 95 mm — boven grenswaarde. Directe lediging uitgevoerd door TankRein B.V. (afvoerbon BAL-2026-0345). Hercontrole binnen 4 weken.',
    hercontrole.toISOString().slice(0, 10));

  step(10, 'PDF genereren', 'Afkeur-rapport voor klant + dossier');
  await generatePdf(page);

  info('❌ Eindoordeel: AFGEKEURD');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
