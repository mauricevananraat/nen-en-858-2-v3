import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLediging,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 6,
  label: 'Berken HERCONTROLE — jaarlijks — GOEDGEKEURD',
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
  section(`Scenario 6: ${meta.label}`, '🔁');

  step(1, 'Seed dezelfde klant + voorziening als scenario 3',
       'Hercontrole na afkeuring 4 weken geleden — klant heeft inmiddels gelediget');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = jaarlijks (hercontrole-flag in opmerkingen)', '');
  await setInterval(page, 'jaarlijks');

  step(4, 'Sectie 1 — vermelding hercontrole in weersomstandigheden', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'HERCONTROLE na afkeur 2026-04-15. Droog, 12°C.'
  });

  step(5, 'Olielaag 28mm — fors gedaald na lediging',
       'Adviesblok GROEN — installatie functioneert weer correct');
  await fillMeting(page, { olielaag: 28, slib: 8 });
  info('Adviesblok: groen "binnen grens"');

  step(6, 'Functietesten — opnieuw uitgevoerd', '');
  await fillResultGroup(page, 'functietesten', {
    auto_afsluiter:  { resultaat: 'voldoet', opmerking: '' },
    alarm_olielaag:  { resultaat: 'voldoet', opmerking: 'Alarm gereset, werkt correct' },
    alarm_hoogwater: { resultaat: 'voldoet', opmerking: '' }
  });

  step(7, 'Lediging-blok — referentie naar uitgevoerde lediging',
       'Bewijs van afvoer + BAL-referentie uit scenario 3');
  await fillLediging(page, {
    lediging: { obas: 'ja', slibvang: 'ja' },
    bal: {
      verwerker: 'TankRein B.V.',
      afvoerbon: 'BAL-2026-0345',
      euralcode: '13.05.06',
      hoeveelheid_l: 9500
    }
  });

  step(8, 'Foto overzicht + meting "NA LEDIGING" + afvoerbon',
        '3 foto\'s: overzicht (blauw) + groene meting + afvoerbon (blauw)');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-10', sublabel: 'hercontrole Berken', status: 'neutraal'
  }));
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 28mm', sublabel: 'NA LEDIGING — OK', status: 'ok'
  }));
  await injectFoto(page, 'afvalstroomformulier', svgPhoto({
    label: 'AFVOERBON', sublabel: 'BAL-2026-0345 TankRein', status: 'neutraal'
  }));

  step(9, 'Eindoordeel = GOEDGEKEURD — afkeuring opgeheven',
       'Volgende reguliere inspectie over 1 jaar');
  const volgende = new Date();
  volgende.setFullYear(volgende.getFullYear() + 1);
  await setEindoordeel(page, 'goedgekeurd',
    'HERCONTROLE na afkeuring 2026-04-15. Lediging uitgevoerd door TankRein B.V. (BAL-2026-0345, 9.500 L). Olielaag nu 28 mm — ruim onder grens. Afkeuring opgeheven. Volgende reguliere inspectie 2027.',
    volgende.toISOString().slice(0, 10));

  step(10, 'PDF genereren', 'Hercontrole-rapport met opheffing van afkeuring');
  await generatePdf(page);

  info('✅ Eindoordeel: GOEDGEKEURD (afkeuring opgeheven)');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
