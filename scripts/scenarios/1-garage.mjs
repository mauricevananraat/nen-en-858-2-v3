import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 1,
  label: 'Garage van Dijk — halfjaarlijks — GOEDGEKEURD',
  klant: {
    id: 'garage-van-dijk',
    bedrijfsnaam: 'Garage van Dijk B.V.',
    adres: 'Hoofdweg 12',
    postcode_plaats: '7011 AB Gaanderen',
    contactpersoon: 'H. van Dijk',
    telefoon: '0314-555 123'
  },
  voorziening: {
    id: 'obas-ns3-wasplaats',
    naam: 'OBAS NS-3 wasplaats',
    merk: 'Wavin',
    type_bouwjaar: 'OliePass 3 / 2018',
    ns_klasse: 'I',
    capaciteit_l: 3000,
    mat_opbouw: 'beton',
    inlaat_mm: 110,
    uitlaat_mm: 110
  }
};

export async function run(page) {
  section(`Scenario 1: ${meta.label}`, '🚗');

  step(1, 'Klant + voorziening seeden in localStorage',
       'Inspecteur opent tool op locatie — klantgegevens al bekend uit Symitech-database');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer Garage van Dijk uit klanten-dropdown',
       'Installatie-specs vullen automatisch in sectie 1');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = halfjaarlijks',
       'Periodieke controle — geen OBAS-24 checklist, geen lekdichtheidstest');
  await setInterval(page, 'halfjaarlijks');

  step(4, 'Sectie 1 — projectgegevens invoeren',
       'Inspecteur, datum, weersomstandigheden');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Droog, 18°C'
  });

  step(5, 'Sectie 2 — metingen invoeren',
       'Olielaag 35mm (35% van 100mm grens) — ruim onder 80% → GROEN advies');
  await fillMeting(page, { olielaag: 35, slib: 12 });
  info('Adviesblok: groen, geen lediging vereist');

  step(6, 'Foto "OVERZICHT OBAS NS-3" injecteren',
       'Standaard overzicht-foto voor in PDF');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-3', sublabel: 'wasplaats Garage van Dijk', status: 'neutraal'
  }));

  step(7, 'Foto "OLIELAAG 35mm OK" injecteren bij metingen',
       'Bewijs van meting — past bij groene advies-status');
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 35mm', sublabel: 'binnen grens 80%', status: 'ok'
  }));

  step(8, 'Eindoordeel = GOEDGEKEURD',
       'Volgende inspectie over 6 maanden');
  const volgende = new Date();
  volgende.setMonth(volgende.getMonth() + 6);
  await setEindoordeel(page, 'goedgekeurd',
    'Olielaagdikte 35 mm — ruim onder grenswaarde. Installatie functioneert correct.',
    volgende.toISOString().slice(0, 10));

  step(9, 'PDF genereren', 'Halfjaarlijks rapport voor klant + dossier');
  await generatePdf(page);

  info('✅ Eindoordeel: GOEDGEKEURD');
}

// Standalone draaibaar: node scripts/scenarios/1-garage.mjs
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
