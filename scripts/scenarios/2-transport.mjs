import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 2,
  label: 'Trans-Vechtdal Transport — jaarlijks — opmerking',
  klant: {
    id: 'trans-vechtdal',
    bedrijfsnaam: 'Trans-Vechtdal Transport B.V.',
    adres: 'Industrieweg 45',
    postcode_plaats: '7731 KE Ommen',
    contactpersoon: 'A. Holtkamp',
    telefoon: '0529-555 678'
  },
  voorziening: {
    id: 'obas-ns6-tankplaats',
    naam: 'OBAS NS-6 tankplaats',
    merk: 'ACO',
    type_bouwjaar: 'Oleopator C / 2015',
    ns_klasse: 'II',
    capaciteit_l: 6000,
    mat_opbouw: 'kunststof',
    inlaat_mm: 160,
    uitlaat_mm: 160
  }
};

export async function run(page) {
  section(`Scenario 2: ${meta.label}`, '🚛');

  step(1, 'Seed klant + voorziening', 'Trans-Vechtdal — bekende relatie, jaarlijkse cyclus');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', 'OBAS NS-6 kunststof, 6m³');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = jaarlijks', 'Jaarcyclus — functietesten verplicht, geen OBAS-24');
  await setInterval(page, 'jaarlijks');

  step(4, 'Sectie 1 invullen', 'Inspecteur, datum, weersomstandigheden');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Bewolkt, 14°C'
  });

  step(5, 'Olielaag 76mm — krap onder 80% grens',
       'Adviesblok ORANJE — preventief plannen lediging');
  await fillMeting(page, { olielaag: 76, slib: 45 });
  info('Adviesblok: oranje "let op — krap onder grens"');

  step(6, 'Functietesten — auto-afsluiter + alarmen OK',
       'Bij jaarlijks moeten alle 3 functietesten getest');
  await fillResultGroup(page, 'functietesten', {
    auto_afsluiter:  { resultaat: 'voldoet', opmerking: '' },
    alarm_olielaag:  { resultaat: 'voldoet', opmerking: '' },
    alarm_hoogwater: { resultaat: 'voldoet', opmerking: '' }
  });

  step(7, 'Foto overzicht + foto met krappe meting',
       'Visueel bewijs voor in rapport');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-6', sublabel: 'tankplaats Trans-Vechtdal', status: 'neutraal'
  }));
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 76mm', sublabel: 'KRAP onder grens 80mm', status: 'opmerking'
  }));

  step(8, 'Eindoordeel = GOEDGEKEURD MET OPMERKING',
       'Klant adviseren lediging binnen 3 maanden in te plannen');
  const volgende = new Date();
  volgende.setFullYear(volgende.getFullYear() + 1);
  await setEindoordeel(page, 'goedgekeurd_met_opmerking',
    'Olielaagdikte 76 mm — krap onder grenswaarde. Lediging binnen 3 maanden inplannen.',
    volgende.toISOString().slice(0, 10));

  step(9, 'PDF genereren', 'Jaarrapport met opmerking voor klant');
  await generatePdf(page);

  info('⚠ Eindoordeel: GOEDGEKEURD MET OPMERKING');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
