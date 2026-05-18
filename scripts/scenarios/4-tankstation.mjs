import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLekdichtheid, fillCoating,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 4,
  label: 'Esso A50 — 5-jaarlijks — GOEDGEKEURD',
  klant: {
    id: 'esso-a50-oost',
    bedrijfsnaam: 'Esso Tankstation A50 Oost',
    adres: 'Rijksweg A50 7',
    postcode_plaats: '6629 HZ Apeldoorn',
    contactpersoon: 'R. Velthuis (stationmanager)',
    telefoon: '055-555 234'
  },
  voorziening: {
    id: 'obas-ns15-pomp3',
    naam: 'OBAS NS-15 naast pomp 3',
    merk: 'ACO',
    type_bouwjaar: 'Oleopator K / 2021',
    ns_klasse: 'II',
    capaciteit_l: 15000,
    mat_opbouw: 'beton + coating',
    inlaat_mm: 200,
    uitlaat_mm: 200
  }
};

const OBAS24_ALLES_OK = Object.fromEntries(
  ['afdekkingen', 'opbouw_obas', 'vlotterbal', 'vlotterbalschotel', 'grofvuilrooster',
   'inlaat_obas', 'uitlaat_obas', 'niveau_obas', 'capaciteit_obas',
   'opbouw_slibvangput', 'inlaat_slibvangput', 'uitlaat_slibvangput',
   'niveau_slibvangput', 'inhoud_slibvangput', 'controleput', 'niveau_controleput',
   'lozing', 'effluent_visueel', 'coalescentiefilter', 'alarm_olielaagdikte',
   'alarm_hoogwater', 'recycleput', 'accumat', 'afvoerkanaal_gereinigd'
  ].map(k => [k, { resultaat: 'voldoet', opmerking: '' }])
);

export async function run(page) {
  section(`Scenario 4: ${meta.label}`, '⛽');

  step(1, 'Seed klant + voorziening', 'Tankstation Esso — 5-jaarlijkse keuring NS-15');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = 5-jaarlijks',
       'Toont OBAS-24 checklist + §6 inwendig + §7 lekdichtheidstest + §8 coating');
  await setInterval(page, '5jaarlijks');

  step(4, 'Sectie 1', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Helder, 16°C'
  });

  step(5, 'Olielaag 22mm — recent geledigd', 'Ruim onder grens');
  await fillMeting(page, { olielaag: 22, slib: 18 });

  step(6, 'OBAS-24 checklist — alle 24 punten voldoen',
       'Visuele controle door inspecteur — alles in orde');
  await fillResultGroup(page, 'checklist_obas', OBAS24_ALLES_OK);

  step(7, 'Sectie 6 inwendig — alle 5 sub-punten OK',
       'Wanden, schotten, coalescentie, afsluiter, naden visueel OK');
  await fillResultGroup(page, 'inwendig', {
    wanden_bodem:          { resultaat: 'voldoet', opmerking: 'Wanden glad, geen scheuren' },
    schotten_vlotterkoker: { resultaat: 'voldoet', opmerking: 'Schotten intact' },
    coalescentiefilter:    { resultaat: 'voldoet', opmerking: 'Filter schoon, recent vervangen' },
    afsluiter_mechanisch:  { resultaat: 'voldoet', opmerking: 'Afsluiter werkt soepel' },
    naden_aansluitingen:   { resultaat: 'voldoet', opmerking: 'Naden droog, geen lekkage' }
  });

  step(8, 'Sectie 7 lekdichtheidstest — hydrologisch 60 min, waterverlies 2mm',
       'Voldoet ruim aan norm (max 5mm/uur)');
  await fillLekdichtheid(page, {
    testmethode: 'Hydrologisch',
    testduur_min: 60,
    beginniveau_mm: 1500,
    eindniveau_mm: 1498,
    gemeten_verlies_mm: 2,
    toegestaan_mm_uur: 5,
    resultaat: 'voldoet',
    opmerking: 'Lekdichtheid binnen norm'
  });

  step(9, 'Sectie 8 coating — intact', '');
  await fillCoating(page, {
    aanwezig: 'ja',
    type: 'epoxy 2-componenten',
    leeftijd_jaar: 5,
    restlevensduur_jaar: 10,
    visuele_staat: 'geen blaren, geen scheuren, kleurvast',
    resultaat: 'voldoet'
  });

  step(10, 'Foto-set: overzicht + 5 §6 OK + lekdichtheid + coating',
        '8 groene OK-foto\'s in PDF');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-15', sublabel: 'Esso A50 pomp 3', status: 'neutraal'
  }));
  const labels = {
    inwendig_wanden:        { l: 'WANDEN', s: 'geen scheuren' },
    inwendig_schotten:      { l: 'SCHOTTEN', s: 'intact' },
    inwendig_coalescentie:  { l: 'COALESCENTIE', s: 'recent vervangen' },
    inwendig_afsluiter:     { l: 'AFSLUITER', s: 'soepel werkend' },
    inwendig_naden:         { l: 'NADEN', s: 'droog, geen lek' }
  };
  for (const slot of Object.keys(labels)) {
    await injectFoto(page, slot, svgPhoto({
      label: labels[slot].l, sublabel: labels[slot].s, status: 'ok'
    }));
  }
  await injectFoto(page, 'lekdichtheid', svgPhoto({
    label: 'LEKDICHTHEID', sublabel: 'verlies 2mm / 60min OK', status: 'ok'
  }));
  await injectFoto(page, 'coating', svgPhoto({
    label: 'COATING', sublabel: 'epoxy intact', status: 'ok'
  }));

  step(11, 'Eindoordeel = GOEDGEKEURD voor 5 jaar', '');
  const volgende = new Date();
  volgende.setFullYear(volgende.getFullYear() + 5);
  await setEindoordeel(page, 'goedgekeurd',
    '5-jaarlijkse keuring uitgevoerd. OBAS-24 checklist: 24/24 voldoen. Lekdichtheidstest: waterverlies 2mm/60min (binnen norm). Coating intact. Volgende 5-jaarlijkse keuring 2031.',
    volgende.toISOString().slice(0, 10));

  step(12, 'PDF genereren', 'Uitgebreid 5-jaarlijks rapport');
  await generatePdf(page);

  info('✅ Eindoordeel: GOEDGEKEURD voor 5 jaar');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
