/* OmniCalc - data/units-core.js
   Static conversion tables, part 1. Linear categories use toBase factors.
   Affine categories (temperature) use: base = (value + offset) * scale.
   Base unit per category is documented in `base`. */

(function () {
  'use strict';

  OC.UNITS = OC.UNITS || {};

  function lin(arr) {
    return arr.map(function (u) {
      return { id: u[0], label: u[1], symbol: u[2], toBase: u[3] };
    });
  }

  function aff(arr) {
    return arr.map(function (u) {
      return { id: u[0], label: u[1], symbol: u[2], offset: u[3], scale: u[4] };
    });
  }

  /* ------------------------------- LENGTH ------------------------------- */
  OC.UNITS.length = {
    name: 'Length & Distance',
    icon: 'straighten',
    desc: 'Meters, feet, miles, light-years and 20 more units of length.',
    keywords: 'distance meter metre feet foot inch mile km yard nautical lightyear parsec',
    group: 'converter',
    type: 'linear',
    base: 'meter',
    defaultFrom: 'kilometer',
    defaultTo: 'mile',
    units: lin([
      ['nanometer', 'Nanometers', 'nm', 1e-9],
      ['micrometer', 'Micrometers', 'µm', 1e-6],
      ['millimeter', 'Millimeters', 'mm', 0.001],
      ['centimeter', 'Centimeters', 'cm', 0.01],
      ['decimeter', 'Decimeters', 'dm', 0.1],
      ['meter', 'Meters', 'm', 1],
      ['kilometer', 'Kilometers', 'km', 1000],
      ['inch', 'Inches', 'in', 0.0254],
      ['foot', 'Feet', 'ft', 0.3048],
      ['yard', 'Yards', 'yd', 0.9144],
      ['mile', 'Miles', 'mi', 1609.344],
      ['nautical-mile', 'Nautical miles', 'nmi', 1852],
      ['fathom', 'Fathoms', 'ftm', 1.8288],
      ['furlong', 'Furlongs', 'fur', 201.168],
      ['chain', 'Chains', 'ch', 20.1168],
      ['rod', 'Rods', 'rd', 5.0292],
      ['cubit', 'Cubits (18 in)', 'cbt', 0.4572],
      ['hand', 'Hands', 'hh', 0.1016],
      ['angstrom', 'Ångströms', 'Å', 1e-10],
      ['light-year', 'Light-years', 'ly', 9.4607304725808e15],
      ['parsec', 'Parsecs', 'pc', 3.0856775814913673e16],
      ['astronomical-unit', 'Astronomical units', 'AU', 1.495978707e11]
    ])
  };

  /* -------------------------------- MASS -------------------------------- */
  OC.UNITS.mass = {
    name: 'Weight & Mass',
    icon: 'weight',
    desc: 'Kilograms, pounds, stones, carats, troy ounces and more.',
    keywords: 'weight mass kg pound lb oz stone ton carat gram ounce',
    group: 'converter',
    type: 'linear',
    base: 'kilogram',
    defaultFrom: 'kilogram',
    defaultTo: 'pound',
    units: lin([
      ['microgram', 'Micrograms', 'µg', 1e-9],
      ['milligram', 'Milligrams', 'mg', 1e-6],
      ['gram', 'Grams', 'g', 0.001],
      ['kilogram', 'Kilograms', 'kg', 1],
      ['metric-ton', 'Metric tons (tonnes)', 't', 1000],
      ['ounce', 'Ounces', 'oz', 0.028349523125],
      ['pound', 'Pounds', 'lb', 0.45359237],
      ['stone', 'Stones', 'st', 6.35029318],
      ['us-ton', 'US tons (short)', 'ton', 907.18474],
      ['uk-ton', 'UK tons (long)', 'LT', 1016.0469088],
      ['carat', 'Carats', 'ct', 0.0002],
      ['grain', 'Grains', 'gr', 6.479891e-5],
      ['troy-ounce', 'Troy ounces', 'ozt', 0.0311034768],
      ['amu', 'Atomic mass units', 'u', 1.6605390666e-27]
    ])
  };

  /* ------------------------------- VOLUME ------------------------------- */
  OC.UNITS.volume = {
    name: 'Volume & Capacity',
    icon: 'category',
    desc: 'Litres, gallons, cups, barrels — US, UK and metric systems.',
    keywords: 'volume capacity liter litre gallon quart pint cup tablespoon teaspoon barrel',
    group: 'converter',
    type: 'linear',
    base: 'liter',
    defaultFrom: 'liter',
    defaultTo: 'us-gallon',
    units: lin([
      ['milliliter', 'Milliliters', 'mL', 0.001],
      ['centiliter', 'Centiliters', 'cL', 0.01],
      ['deciliter', 'Deciliters', 'dL', 0.1],
      ['liter', 'Litres', 'L', 1],
      ['cubic-centimeter', 'Cubic centimeters', 'cm³', 0.001],
      ['cubic-meter', 'Cubic meters', 'm³', 1000],
      ['cubic-inch', 'Cubic inches', 'in³', 0.016387064],
      ['cubic-foot', 'Cubic feet', 'ft³', 28.316846592],
      ['cubic-yard', 'Cubic yards', 'yd³', 764.554857984],
      ['us-gallon', 'US gallons', 'gal', 3.785411784],
      ['us-quart', 'US quarts', 'qt', 0.946352946],
      ['us-pint', 'US pints', 'pt', 0.473176473],
      ['us-cup', 'US cups', 'cup', 0.2365882365],
      ['us-fluid-ounce', 'US fluid ounces', 'fl oz', 0.0295735295625],
      ['us-tablespoon', 'US tablespoons', 'tbsp', 0.01478676478125],
      ['us-teaspoon', 'US teaspoons', 'tsp', 0.00492892159375],
      ['imperial-gallon', 'Imperial gallons (UK)', 'imp gal', 4.54609],
      ['imperial-pint', 'Imperial pints (UK)', 'imp pt', 0.56826125],
      ['imperial-fluid-ounce', 'Imperial fluid ounces (UK)', 'imp fl oz', 0.0284130625],
      ['oil-barrel', 'Oil barrels', 'bbl', 158.987294928],
      ['beer-barrel', 'Beer barrels (US)', 'bbl beer', 117.347765304],
      ['us-bushel', 'US bushels', 'bu', 35.23907016688],
      ['uk-bushel', 'UK bushels', 'imp bu', 36.36872]
    ])
  };

  /* -------------------------------- AREA -------------------------------- */
  OC.UNITS.area = {
    name: 'Area',
    icon: 'square_foot',
    desc: 'Square metres, acres, hectares, bigha, marla, katha and more.',
    keywords: 'area square acre hectare bigha marla katha gaj lot land',
    group: 'converter',
    type: 'linear',
    base: 'square-meter',
    defaultFrom: 'square-meter',
    defaultTo: 'square-foot',
    units: lin([
      ['square-millimeter', 'Square millimeters', 'mm²', 1e-6],
      ['square-centimeter', 'Square centimeters', 'cm²', 1e-4],
      ['square-meter', 'Square meters', 'm²', 1],
      ['are', 'Ares', 'a', 100],
      ['hectare', 'Hectares', 'ha', 10000],
      ['square-kilometer', 'Square kilometers', 'km²', 1e6],
      ['square-inch', 'Square inches', 'in²', 0.00064516],
      ['square-foot', 'Square feet', 'ft²', 0.09290304],
      ['square-yard', 'Square yards', 'yd²', 0.83612736],
      ['gaj', 'Gaj (square yards, South Asia)', 'gaj', 0.83612736],
      ['acre', 'Acres', 'ac', 4046.8564224],
      ['square-mile', 'Square miles', 'mi²', 2589988.110336],
      ['cent', 'Cents (India, 1/100 acre)', 'cent', 40.468564224],
      ['bigha', 'Bigha (UP pucca ≈ 3025 yd²)', 'bigha', 2529.285264],
      ['marla', 'Marla (1/160 acre)', 'marla', 25.29285264],
      ['katha', 'Katha (Bengal ≈ 720 ft²)', 'katha', 66.8902]
    ])
  };

  /* ----------------------------- TEMPERATURE ---------------------------- */
  OC.UNITS.temperature = {
    name: 'Temperature',
    icon: 'thermostat',
    desc: 'Celsius, Fahrenheit, Kelvin and historic scales (Réaumur, Delisle, Newton).',
    keywords: 'temperature celsius fahrenheit kelvin rankine reaumur delisle newton degrees',
    group: 'converter',
    type: 'affine',
    base: 'kelvin',
    defaultFrom: 'celsius',
    defaultTo: 'fahrenheit',
    note: 'Conversion is exact up to the reference points of each historical scale.',
    units: aff([
      ['celsius', 'Celsius', '°C', 273.15, 1],
      ['fahrenheit', 'Fahrenheit', '°F', 459.67, 5 / 9],
      ['kelvin', 'Kelvin', 'K', 0, 1],
      ['rankine', 'Rankine', '°R', 0, 5 / 9],
      ['reaumur', 'Réaumur', '°Ré', 218.52, 1.25],
      ['delisle', 'Delisle', '°De', -559.725, -2 / 3],
      ['newton-scale', 'Newton (scale)', '°N', 90.1395, 100 / 33]
    ])
  };

  /* -------------------------------- SPEED ------------------------------- */
  OC.UNITS.speed = {
    name: 'Speed',
    icon: 'speed',
    desc: 'km/h, mph, knots, Mach, metres per second and the speed of light.',
    keywords: 'speed velocity kmh mph knot mach pace mps',
    group: 'converter',
    type: 'linear',
    base: 'meter-per-second',
    defaultFrom: 'kilometer-per-hour',
    defaultTo: 'mile-per-hour',
    units: lin([
      ['meter-per-second', 'Meters/second', 'm/s', 1],
      ['kilometer-per-hour', 'Kilometers/hour', 'km/h', 1 / 3.6],
      ['mile-per-hour', 'Miles/hour', 'mph', 0.44704],
      ['foot-per-second', 'Feet/second', 'ft/s', 0.3048],
      ['knot', 'Knots', 'kn', 1852 / 3600],
      ['mach', 'Mach (sea level, 15 °C)', 'Ma', 340.29],
      ['speed-of-light', 'Speed of light', 'c', 299792458]
    ])
  };

  /* -------------------------------- TIME -------------------------------- */
  OC.UNITS.time = {
    name: 'Time',
    icon: 'schedule',
    desc: 'From nanoseconds to millennia.',
    keywords: 'time second minute hour day week month year century millisecond',
    group: 'converter',
    type: 'linear',
    base: 'second',
    defaultFrom: 'hour',
    defaultTo: 'minute',
    units: lin([
      ['nanosecond', 'Nanoseconds', 'ns', 1e-9],
      ['microsecond', 'Microseconds', 'µs', 1e-6],
      ['millisecond', 'Milliseconds', 'ms', 0.001],
      ['second', 'Seconds', 's', 1],
      ['minute', 'Minutes', 'min', 60],
      ['hour', 'Hours', 'h', 3600],
      ['day', 'Days', 'd', 86400],
      ['week', 'Weeks', 'wk', 604800],
      ['month', 'Months (avg 30.44 days)', 'mo', 2629746],
      ['year', 'Years (Gregorian avg)', 'yr', 31556952],
      ['decade', 'Decades', 'dec', 315569520],
      ['century', 'Centuries', 'c', 3155695200],
      ['millennium', 'Millennia', 'mil', 31556952000]
    ])
  };

  /* -------------------------------- ANGLE ------------------------------- */
  OC.UNITS.angle = {
    name: 'Angle',
    icon: 'architecture',
    desc: 'Degrees, radians, gradians, arcminutes, arcseconds and turns.',
    keywords: 'angle degree radian gradian turn arcminute arcsecond',
    group: 'converter',
    type: 'linear',
    base: 'degree',
    defaultFrom: 'degree',
    defaultTo: 'radian',
    units: lin([
      ['degree', 'Degrees', '°', 1],
      ['radian', 'Radians', 'rad', 57.29577951308232],
      ['gradian', 'Gradians', 'gon', 0.9],
      ['milliradian', 'Milliradians', 'mrad', 0.05729577951308232],
      ['arcminute', 'Arcminutes', '′', 1 / 60],
      ['arcsecond', 'Arcseconds', '″', 1 / 3600],
      ['turn', 'Turns / revolutions', 'turn', 360]
    ])
  };

  /* ------------------------------ VISCOSITY ----------------------------- */
  OC.UNITS.viscosity = {
    name: 'Viscosity (dynamic)',
    icon: 'opacity',
    desc: 'Dynamic viscosity: pascal-seconds, poise, centipoise, reyn.',
    keywords: 'viscosity dynamic poise centipoise pa-s reyn fluid',
    group: 'converter',
    type: 'linear',
    base: 'pascal-second',
    defaultFrom: 'centipoise',
    defaultTo: 'pascal-second',
    units: lin([
      ['pascal-second', 'Pascal-seconds', 'Pa·s', 1],
      ['poise', 'Poise', 'P', 0.1],
      ['centipoise', 'Centipoise', 'cP', 0.001],
      ['reyn', 'Reyns', 'reyn', 6894.757293168]
    ])
  };

  OC.UNITS.kinematicViscosity = {
    name: 'Viscosity (kinematic)',
    icon: 'water',
    desc: 'Kinematic viscosity: stokes, centistokes, m²/s.',
    keywords: 'viscosity kinematic stokes centistokes',
    group: 'converter',
    type: 'linear',
    base: 'square-meter-per-second',
    defaultFrom: 'centistokes',
    defaultTo: 'stokes',
    units: lin([
      ['square-meter-per-second', 'Square meters/second', 'm²/s', 1],
      ['stokes', 'Stokes', 'St', 1e-4],
      ['centistokes', 'Centistokes', 'cSt', 1e-6],
      ['square-foot-per-second', 'Square feet/second', 'ft²/s', 0.09290304],
      ['square-inch-per-second', 'Square inches/second', 'in²/s', 0.00064516]
    ])
  };

  /* ------------------------------ FLOW RATE ----------------------------- */
  OC.UNITS.flow = {
    name: 'Flow Rate',
    icon: 'air',
    desc: 'L/min, gallons/min, CFM, m³/h and more.',
    keywords: 'flow rate cfm gpm liter minute cubic gallon',
    group: 'converter',
    type: 'linear',
    base: 'cubic-meter-per-second',
    defaultFrom: 'liter-per-minute',
    defaultTo: 'gallon-per-minute',
    note: 'Water-flow entries assume water at 4 °C (1 kg of water ≈ 1 litre).',
    units: lin([
      ['cubic-meter-per-second', 'Cubic meters/second', 'm³/s', 1],
      ['cubic-meter-per-hour', 'Cubic meters/hour', 'm³/h', 1 / 3600],
      ['liter-per-second', 'Litres/second', 'L/s', 0.001],
      ['liter-per-minute', 'Litres/minute', 'L/min', 1 / 60000],
      ['liter-per-hour', 'Litres/hour', 'L/h', 1 / 3600000],
      ['gallon-per-minute', 'US gallons/minute', 'gpm', 6.30901964e-5],
      ['gallon-per-hour', 'US gallons/hour', 'gph', 1.0515032733333334e-6],
      ['cfm', 'CFM (cubic feet/min)', 'CFM', 4.719474432e-4],
      ['cubic-foot-per-second', 'Cubic feet/second', 'cfs', 0.028316846592],
      ['barrel-per-day', 'Oil barrels/day', 'bpd', 158.987294928 / 86400],
      ['kg-per-second-water', 'Kilograms/second (water)', 'kg/s', 0.001]
    ])
  };

  /* --------------------------- TYPOGRAPHY / CSS ------------------------- */
  OC.UNITS.typography = {
    name: 'Screen & Typography',
    icon: 'aspect_ratio',
    desc: 'Pixels, points, picas, inches and em values at 96 DPI.',
    keywords: 'typography pixel point pica em rem dpi ppi aspect ratio font',
    group: 'converter',
    type: 'linear',
    base: 'pixel96',
    defaultFrom: 'pixel96',
    defaultTo: 'point',
    note: 'Assumes CSS reference of 96 DPI and a 16 px root font size.',
    units: lin([
      ['pixel96', 'Pixels (96 DPI)', 'px', 1],
      ['point', 'Points', 'pt', 96 / 72],
      ['pica', 'Picas', 'pc', 16],
      ['inch96', 'Inches (CSS)', 'in', 96],
      ['centimeter96', 'Centimeters (CSS)', 'cm', 96 / 2.54],
      ['millimeter96', 'Millimeters (CSS)', 'mm', 96 / 25.4],
      ['quarter-mm', 'Quarter-millimeters', 'Q', 96 / 101.6],
      ['em16', 'Em (16 px base)', 'em', 16],
      ['rem16', 'Rem (16 px root)', 'rem', 16]
    ])
  };

  /* ------------------------------ RADIATION ----------------------------- */
  OC.UNITS.radiationDose = {
    name: 'Radiation Dose',
    icon: 'dangerous',
    desc: 'Sieverts, rem, gray, rad — equivalent dose for typical exposures.',
    keywords: 'radiation dose sievert rem gray rad nuclear',
    group: 'converter',
    type: 'linear',
    base: 'sievert',
    defaultFrom: 'microsievert',
    defaultTo: 'millisievert',
    note: 'Gray (absorbed) and sievert (equivalent) are treated 1:1, valid for x-ray, gamma and beta.',
    units: lin([
      ['sievert', 'Sieverts', 'Sv', 1],
      ['millisievert', 'Millisieverts', 'mSv', 1e-3],
      ['microsievert', 'Microsieverts', 'µSv', 1e-6],
      ['rem', 'Rem', 'rem', 0.01],
      ['millirem', 'Millirem', 'mrem', 1e-5],
      ['gray', 'Gray (absorbed)', 'Gy', 1],
      ['rad', 'Rad (absorbed)', 'rad', 0.01]
    ])
  };

  OC.UNITS.radioactivity = {
    name: 'Radioactivity',
    icon: 'radioactive',
    desc: 'Becquerels, curies and derived units of activity.',
    keywords: 'radioactivity becquerel curie bq ci decays',
    group: 'converter',
    type: 'linear',
    base: 'becquerel',
    defaultFrom: 'becquerel',
    defaultTo: 'curie',
    units: lin([
      ['becquerel', 'Becquerels', 'Bq', 1],
      ['kilobecquerel', 'Kilobecquerels', 'kBq', 1e3],
      ['megabecquerel', 'Megabecquerels', 'MBq', 1e6],
      ['gigabecquerel', 'Gigabecquerels', 'GBq', 1e9],
      ['curie', 'Curies', 'Ci', 3.7e10],
      ['millicurie', 'Millicuries', 'mCi', 3.7e7],
      ['microcurie', 'Microcuries', 'µCi', 3.7e4],
      ['rutherford', 'Rutherfords', 'Rd', 1e6]
    ])
  };
})();
