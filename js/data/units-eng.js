/* OmniCalc - data/units-eng.js
   Static conversion tables, part 2: engineering, digital, fuel, historical. */

(function () {
  'use strict';

  OC.UNITS = OC.UNITS || {};

  function lin(arr) {
    return arr.map(function (u) {
      return { id: u[0], label: u[1], symbol: u[2], toBase: u[3] };
    });
  }

  /* ------------------------------- PRESSURE ----------------------------- */
  OC.UNITS.pressure = {
    name: 'Pressure',
    icon: 'compress',
    desc: 'Pascals, bar, PSI, atmospheres, torr and liquid columns.',
    keywords: 'pressure pascal bar psi atmosphere atm torr mmhg inhg',
    group: 'converter',
    type: 'linear',
    base: 'pascal',
    defaultFrom: 'bar',
    defaultTo: 'psi',
    units: lin([
      ['pascal', 'Pascals', 'Pa', 1],
      ['hectopascal', 'Hectopascals', 'hPa', 100],
      ['kilopascal', 'Kilopascals', 'kPa', 1000],
      ['megapascal', 'Megapascals', 'MPa', 1e6],
      ['bar', 'Bar', 'bar', 1e5],
      ['millibar', 'Millibars', 'mbar', 100],
      ['psi', 'Pounds/sq inch', 'psi', 6894.757293168],
      ['atmosphere', 'Atmospheres', 'atm', 101325],
      ['torr', 'Torr', 'Torr', 101325 / 760],
      ['mmhg', 'mm of mercury', 'mmHg', 133.322387415],
      ['inhg', 'Inches of mercury', 'inHg', 3386.389],
      ['mmh2o', 'mm of water (4 °C)', 'mmH₂O', 9.80665]
    ])
  };

  /* -------------------------------- ENERGY ------------------------------ */
  OC.UNITS.energy = {
    name: 'Energy',
    icon: 'local_fire_department',
    desc: 'Joules, calories, kWh, BTU, electronvolts, foot-pounds.',
    keywords: 'energy joule calorie kcal watt hour btu electronvolt foot pound erg therm',
    group: 'converter',
    type: 'linear',
    base: 'joule',
    defaultFrom: 'kilojoule',
    defaultTo: 'kilocalorie',
    units: lin([
      ['joule', 'Joules', 'J', 1],
      ['kilojoule', 'Kilojoules', 'kJ', 1000],
      ['calorie', 'Calories (small)', 'cal', 4.184],
      ['kilocalorie', 'Kilocalories (food Cal)', 'kcal', 4184],
      ['watt-hour', 'Watt-hours', 'Wh', 3600],
      ['kilowatt-hour', 'Kilowatt-hours', 'kWh', 3.6e6],
      ['btu', 'British thermal units', 'BTU', 1055.05585262],
      ['therm', 'Therms', 'thm', 1.05505585262e8],
      ['electronvolt', 'Electronvolts', 'eV', 1.602176634e-19],
      ['foot-pound', 'Foot-pounds', 'ft·lb', 1.3558179483314004],
      ['erg', 'Ergs', 'erg', 1e-7]
    ])
  };

  /* --------------------------------- POWER ------------------------------ */
  OC.UNITS.power = {
    name: 'Power',
    icon: 'bolt',
    desc: 'Watts, kilowatts, horsepower (mechanical, metric, electrical), BTU/h.',
    keywords: 'power watt kilowatt megawatt horsepower hp btu',
    group: 'converter',
    type: 'linear',
    base: 'watt',
    defaultFrom: 'kilowatt',
    defaultTo: 'horsepower-mechanical',
    units: lin([
      ['watt', 'Watts', 'W', 1],
      ['kilowatt', 'Kilowatts', 'kW', 1000],
      ['megawatt', 'Megawatts', 'MW', 1e6],
      ['gigawatt', 'Gigawatts', 'GW', 1e9],
      ['horsepower-mechanical', 'Horsepower (mechanical)', 'hp', 745.6998715822702],
      ['horsepower-metric', 'Horsepower (metric, PS)', 'PS', 735.49875],
      ['horsepower-electrical', 'Horsepower (electrical)', 'hp(E)', 746],
      ['btu-per-hour', 'BTU/hour', 'BTU/h', 0.2930710701722222]
    ])
  };

  /* --------------------------------- FORCE ------------------------------ */
  OC.UNITS.force = {
    name: 'Force',
    icon: 'fitness_center',
    desc: 'Newtons, dynes, pound-force, kilogram-force, poundals.',
    keywords: 'force newton dyne pound force lbf kgf poundal kip',
    group: 'converter',
    type: 'linear',
    base: 'newton',
    defaultFrom: 'newton',
    defaultTo: 'pound-force',
    units: lin([
      ['newton', 'Newtons', 'N', 1],
      ['kilonewton', 'Kilonewtons', 'kN', 1000],
      ['dyne', 'Dynes', 'dyn', 1e-5],
      ['pound-force', 'Pounds-force', 'lbf', 4.4482216152605],
      ['kilogram-force', 'Kilograms-force', 'kgf', 9.80665],
      ['ounce-force', 'Ounces-force', 'ozf', 0.27801385095378125],
      ['poundal', 'Poundals', 'pdl', 0.138254954376],
      ['kip', 'Kips (1000 lbf)', 'kip', 4448.2216152605]
    ])
  };

  /* -------------------------------- TORQUE ------------------------------ */
  OC.UNITS.torque = {
    name: 'Torque',
    icon: 'rotate_right',
    desc: 'Newton-metres, foot-pounds, inch-pounds, kgf·m.',
    keywords: 'torque newton meter foot pound inch wrench nm',
    group: 'converter',
    type: 'linear',
    base: 'newton-meter',
    defaultFrom: 'newton-meter',
    defaultTo: 'foot-pound',
    units: lin([
      ['newton-meter', 'Newton-metres', 'N·m', 1],
      ['foot-pound-torque', 'Foot-pounds', 'ft·lb', 1.3558179483314004],
      ['inch-pound', 'Inch-pounds', 'in·lb', 0.1129848290276167],
      ['kilogram-force-meter', 'Kilogram-force metres', 'kgf·m', 9.80665],
      ['dyne-centimeter', 'Dyne-centimetres', 'dyn·cm', 1e-7]
    ])
  };

  /* ----------------------------- FUEL ECONOMY ---------------------------- */
  OC.UNITS.fuel = {
    name: 'Fuel Efficiency',
    icon: 'local_gas_station',
    desc: 'MPG (US & UK), L/100 km, km/L — including inverted consumption math.',
    keywords: 'fuel efficiency mileage mpg l/100km km/l gas consumption',
    group: 'converter',
    type: 'fuel',
    base: 'kilometer-per-liter',
    defaultFrom: 'mpg-us',
    defaultTo: 'liter-per-100km',
    note: 'Economy units (MPG, km/L) are inversely related to consumption units (L/100 km).',
    units: [
      { id: 'mpg-us', label: 'Miles/gallon (US)', symbol: 'mpg' },
      { id: 'mpg-uk', label: 'Miles/gallon (UK)', symbol: 'mpg UK' },
      { id: 'kilometer-per-liter', label: 'Kilometers/litre', symbol: 'km/L' },
      { id: 'mile-per-liter', label: 'Miles/litre', symbol: 'mi/L' },
      { id: 'liter-per-100km', label: 'Litres/100 km', symbol: 'L/100km' }
    ]
  };

  /* --------------------------- DIGITAL STORAGE -------------------------- */
  OC.UNITS.digital = {
    name: 'Digital Storage',
    icon: 'sd_storage',
    desc: 'Bytes, bits and both the 1000-based (kB) and 1024-based (KiB) families.',
    keywords: 'digital storage byte bit kilobyte kib megabyte gigabyte terabyte data',
    group: 'converter',
    type: 'linear',
    base: 'byte',
    defaultFrom: 'gigabyte',
    defaultTo: 'gibibyte',
    units: lin([
      ['bit', 'Bits', 'b', 0.125],
      ['byte', 'Bytes', 'B', 1],
      ['kilobyte', 'Kilobytes (1000)', 'kB', 1e3],
      ['kibibyte', 'Kibibytes (1024)', 'KiB', 1024],
      ['megabyte', 'Megabytes (1000²)', 'MB', 1e6],
      ['mebibyte', 'Mebibytes (1024²)', 'MiB', 1048576],
      ['gigabyte', 'Gigabytes (1000³)', 'GB', 1e9],
      ['gibibyte', 'Gibibytes (1024³)', 'GiB', 1073741824],
      ['terabyte', 'Terabytes (1000⁴)', 'TB', 1e12],
      ['tebibyte', 'Tebibytes (1024⁴)', 'TiB', 1099511627776],
      ['petabyte', 'Petabytes (1000⁵)', 'PB', 1e15],
      ['pebibyte', 'Pebibytes (1024⁵)', 'PiB', 1125899906842624],
      ['exabyte', 'Exabytes (1000⁶)', 'EB', 1e18],
      ['exbibyte', 'Exbibytes (1024⁶)', 'EiB', 1152921504606846976],
      ['zettabyte', 'Zettabytes (1000⁷)', 'ZB', 1e21],
      ['zebibyte', 'Zebibytes (1024⁷)', 'ZiB', 1180591620717411303424],
      ['yottabyte', 'Yottabytes (1000⁸)', 'YB', 1e24]
    ])
  };

  /* -------------------------- DATA TRANSFER RATE ------------------------ */
  OC.UNITS.transfer = {
    name: 'Data Transfer Rate',
    icon: 'network_check',
    desc: 'bps, Mbps, Gbps, MB/s — bits versus bytes per second.',
    keywords: 'data transfer rate bandwidth bps mbps gbps megabyte per second network speed',
    group: 'converter',
    type: 'linear',
    base: 'bit-per-second',
    defaultFrom: 'megabit-per-second',
    defaultTo: 'megabyte-per-second',
    units: lin([
      ['bit-per-second', 'Bits/second', 'bps', 1],
      ['kilobit-per-second', 'Kilobits/second', 'kbps', 1e3],
      ['megabit-per-second', 'Megabits/second', 'Mbps', 1e6],
      ['gigabit-per-second', 'Gigabits/second', 'Gbps', 1e9],
      ['byte-per-second', 'Bytes/second', 'B/s', 8],
      ['kilobyte-per-second', 'Kilobytes/second', 'kB/s', 8000],
      ['megabyte-per-second', 'Megabytes/second', 'MB/s', 8e6],
      ['gigabyte-per-second', 'Gigabytes/second', 'GB/s', 8e9],
      ['kibibit-per-second', 'Kibibits/second', 'Kibit/s', 1024],
      ['mebibit-per-second', 'Mebibits/second', 'Mibit/s', 1048576],
      ['gibibit-per-second', 'Gibibits/second', 'Gibit/s', 1073741824],
      ['gibibyte-per-second', 'Gibibytes/second', 'GiB/s', 8589934592]
    ])
  };

  /* --------------------------- HISTORICAL UNITS ------------------------- */
  OC.UNITS.historical = {
    name: 'Historical & Obscure',
    icon: 'history_edu',
    desc: 'Cubits, leagues, versts, shaku, li, smoots and other oddities — all in metres.',
    keywords: 'historical obscure ancient cubit league verst shaku li smoot roman greek pace span ell barleycorn',
    group: 'converter',
    type: 'linear',
    base: 'meter',
    defaultFrom: 'meter',
    defaultTo: 'smoot',
    note: 'Historical units varied by era and region; values are the commonly cited standard approximations.',
    units: lin([
      ['meter', 'Meters (modern)', 'm', 1],
      ['egyptian-royal-cubit', 'Egyptian royal cubits', 'royal cubit', 0.5236],
      ['roman-cubit', 'Roman cubits', 'cubitum', 0.444],
      ['common-cubit', 'Common cubits (18 in)', 'cubit', 0.4572],
      ['roman-foot', 'Roman feet (pes)', 'pes', 0.296],
      ['greek-stadion', 'Greek stadia', 'stadion', 185],
      ['roman-mile', 'Roman miles (mille passus)', 'mille', 1479.5],
      ['league', 'Leagues (3 miles)', 'lea', 4828.032],
      ['verst', 'Versts (Russia)', 'verst', 1066.8],
      ['shaku', 'Shaku (Japan)', '尺', 10 / 33],
      ['li', 'Li (China)', '里', 500],
      ['smoot', 'Smoots (MIT)', 'smoot', 1.7018],
      ['pace', 'Paces (30 in)', 'pace', 0.762],
      ['span', 'Spans (9 in)', 'span', 0.2286],
      ['ell', 'Ells (45 in)', 'ell', 1.143],
      ['barleycorn', 'Barleycorns (1/3 in)', 'barleycorn', 0.008466666666666667],
      ['hand', 'Hands', 'hand', 0.1016],
      ['fathom', 'Fathoms', 'fathom', 1.8288]
    ])
  };
})();
