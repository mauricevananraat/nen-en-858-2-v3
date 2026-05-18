import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLekdichtheid, fillCoating,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 5,
  label: 'Loonwerker Veldhuis — 5-jaarlijks — AFGEKEURD',
  klant: {
    id: 'loonwerker-veldhuis',
    bedrijfsnaam: 'Loonwerker Veldhuis V.O.F.',
    adres: 'Buurserveldweg 14',
    postcode_plaats: '7481 PC Haaksbergen',
    contactpersoon: 'G. Veldhuis',
    telefoon: '053-555 567'
  },
  voorziening: {
    id: 'obas-ns6-machinewasplaats',
    naam: 'OBAS NS-6 machinewasplaats',
    merk: 'Aquafix',
    type_bouwjaar: 'AF-6K / 2010',
    ns_klasse: 'II',
    capaciteit_l: 6000,
    mat_opbouw: 'kunststof',
    inlaat_mm: 160,
    uitlaat_mm: 160
  }
};

const OBAS24_2_DEFECT = Object.fromEntries(
  ['afdekkingen', 'opbouw_obas', 'vlotterbal', 'vlotterbalschotel', 'grofvuilrooster',
   'inlaat_obas', 'uitlaat_obas', 'niveau_obas', 'capaciteit_obas',
   'opbouw_slibvangput', 'inlaat_slibvangput', 'uitlaat_slibvangput',
   'niveau_slibvangput', 'inhoud_slibvangput', 'controleput', 'niveau_controleput',
   'lozing', 'effluent_visueel', 'alarm_olielaagdikte',
   'alarm_hoogwater', 'recycleput', 'accumat', 'afvoerkanaal_gereinigd'
  ].map(k => [k, { resultaat: 'voldoet', opmerking: '' }])
);
OBAS24_2_DEFECT.coalescentiefilter = { resultaat: 'voldoet_niet', opmerking: 'Filter ernstig vervuild — vervangen vereist' };

export async function run(page) {
  section(`Scenario 5: ${meta.label}`, '🚜');

  step(1, 'Seed klant + voorziening', 'Loonwerker — oudere OBAS uit 2010, 5-jaarlijkse keuring');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = 5-jaarlijks', '');
  await setInterval(page, '5jaarlijks');

  step(4, 'Sectie 1', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Bewolkt, 11°C'
  });

  step(5, 'Olielaag 45mm — onder grens, geen lediging-aanleiding',
       'Probleem zit in lekdichtheid + coating, niet in olielaag');
  await fillMeting(page, { olielaag: 45, slib: 60 });

  step(6, 'OBAS-24 — coalescentiefilter afgekeurd', '');
  await fillResultGroup(page, 'checklist_obas', OBAS24_2_DEFECT);

  step(7, 'Sectie 6 inwendig — coalescentie vuil + naden lek',
       'Belangrijkste defecten zichtbaar bij inwendige controle');
  await fillResultGroup(page, 'inwendig', {
    wanden_bodem:          { resultaat: 'voldoet', opmerking: '' },
    schotten_vlotterkoker: { resultaat: 'voldoet', opmerking: '' },
    coalescentiefilter:    { resultaat: 'voldoet_niet', opmerking: 'Filter ernstig vervuild' },
    afsluiter_mechanisch:  { resultaat: 'voldoet', opmerking: '' },
    naden_aansluitingen:   { resultaat: 'voldoet_niet', opmerking: 'Lichte lekkage bij tussenwand-naad' }
  });

  step(8, 'Sectie 7 lekdichtheidstest — FAALT',
       'Waterverlies 35mm in 60min (max 5mm) — duidelijk lek');
  await fillLekdichtheid(page, {
    testmethode: 'Hydrologisch',
    testduur_min: 60,
    beginniveau_mm: 1500,
    eindniveau_mm: 1465,
    gemeten_verlies_mm: 35,
    toegestaan_mm_uur: 5,
    resultaat: 'voldoet_niet',
    opmerking: 'Waterverlies 35mm — ver boven norm. Lekkage waarschijnlijk bij tussenwand-naad.'
  });

  step(9, 'Sectie 8 coating — scheuren tussenwand', '');
  await fillCoating(page, {
    aanwezig: 'ja',
    type: 'PU 1-component',
    leeftijd_jaar: 16,
    restlevensduur_jaar: 0,
    visuele_staat: 'scheuren in coating tussenwand, beginnende blaarvorming bij naden',
    resultaat: 'voldoet_niet'
  });

  step(10, 'Foto-set: overzicht + 5x defect',
        '6 foto\'s — 1 overzicht (blauw) + 5x rood defect-bewijs');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-6', sublabel: 'machinewasplaats Veldhuis', status: 'neutraal'
  }));
  await injectFoto(page, 'inwendig_coalescentie', svgPhoto({
    label: 'COALESCENTIE', sublabel: 'ernstig vervuild', status: 'defect'
  }));
  await injectFoto(page, 'inwendig_naden', svgPhoto({
    label: 'NADEN', sublabel: 'lekkage tussenwand', status: 'defect'
  }));
  await injectFoto(page, 'lekdichtheid', svgPhoto({
    label: 'WATERVERLIES 35mm', sublabel: 'norm: max 5mm/uur', status: 'defect'
  }));
  await injectFoto(page, 'coating', svgPhoto({
    label: 'COATINGSCHEUR', sublabel: 'tussenwand', status: 'defect'
  }));
  await injectFoto(page, 'coating', svgPhoto({
    label: 'BLAARVORMING', sublabel: 'beginnend bij naden', status: 'defect'
  }));

  step(11, 'Eindoordeel = AFGEKEURD',
        'Herstel coating + lekdichtheidsherstel + nieuwe coalescentie. Herinspectie 8 weken.');
  const herinspectie = new Date();
  herinspectie.setDate(herinspectie.getDate() + 56);
  await setEindoordeel(page, 'afgekeurd',
    '5-jaarlijkse keuring AFGEKEURD. Lekdichtheidstest faalt (waterverlies 35mm/60min). Coalescentiefilter ernstig vervuild — vervanging vereist. Coating vertoont scheuren en blaarvorming tussenwand. Herstelwerkzaamheden uitvoeren, daarna herinspectie binnen 8 weken.',
    herinspectie.toISOString().slice(0, 10));

  step(12, 'PDF genereren', '5-jaarlijks afkeur-rapport');
  await generatePdf(page);

  info('❌ Eindoordeel: AFGEKEURD');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
