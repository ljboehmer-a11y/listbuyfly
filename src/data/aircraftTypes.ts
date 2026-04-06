/**
 * Comprehensive general aviation aircraft database.
 * Each model is tagged with a category so filters cascade: Type → Make → Model.
 */

export interface AircraftModel {
  model: string;
  category: string;
}

export interface AircraftMake {
  make: string;
  models: AircraftModel[];
}

/** Aircraft category types */
export const AIRCRAFT_CATEGORIES = [
  'Single Engine Piston',
  'Multi Engine Piston',
  'Single Engine Turboprop',
  'Multi Engine Turboprop',
  'Very Light Jet',
  'Light Jet',
  'Midsize Jet',
  'Heavy Jet',
  'Amphibian / Float',
  'Experimental / Homebuilt',
  'Aerobatic',
  'Light Sport (LSA)',
  'Warbird',
  'Helicopter',
];

const SEP = 'Single Engine Piston';
const MEP = 'Multi Engine Piston';
const SET = 'Single Engine Turboprop';
const MET = 'Multi Engine Turboprop';
const VLJ = 'Very Light Jet';
const LJ  = 'Light Jet';
const MJ  = 'Midsize Jet';
const HJ  = 'Heavy Jet';
const AMP = 'Amphibian / Float';
const EXP = 'Experimental / Homebuilt';
const AER = 'Aerobatic';
const LSA = 'Light Sport (LSA)';
const WAR = 'Warbird';
const HEL = 'Helicopter';

function m(model: string, category: string): AircraftModel {
  return { model, category };
}

export const AIRCRAFT_DATABASE: AircraftMake[] = [
  {
    make: 'Aeronca',
    models: [
      m('7AC Champion', SEP), m('7BCM Champion', SEP), m('7DC Champion', SEP),
      m('7EC Traveler', SEP), m('11AC Chief', SEP), m('11CC Super Chief', SEP),
      m('15AC Sedan', SEP), m('65-CA Super Chief', SEP),
    ],
  },
  {
    make: 'American Champion',
    models: [
      m('7ECA Citabria', SEP), m('7GCAA Citabria', SEP), m('7GCBC Explorer', SEP),
      m('7KCAB Citabria', AER), m('8KCAB Decathlon', AER), m('8GCBC Scout', SEP),
      m('7EC Traveler', SEP),
    ],
  },
  {
    make: 'Aviat',
    models: [
      m('Husky A-1', SEP), m('Husky A-1A', SEP), m('Husky A-1B', SEP), m('Husky A-1C-180', SEP),
      m('Husky A-1C-200', SEP),
      m('Pitts S-1S', AER), m('Pitts S-1T', AER), m('Pitts S-2A', AER),
      m('Pitts S-2B', AER), m('Pitts S-2C', AER), m('Pitts S-2S', AER),
    ],
  },
  {
    make: 'Beechcraft',
    models: [
      // Bonanza line
      m('33 Debonair', SEP), m('33A Debonair', SEP), m('33C Debonair', SEP),
      m('35 Bonanza', SEP), m('A35 Bonanza', SEP), m('B35 Bonanza', SEP), m('C35 Bonanza', SEP),
      m('D35 Bonanza', SEP), m('E35 Bonanza', SEP), m('F35 Bonanza', SEP), m('G35 Bonanza', SEP),
      m('H35 Bonanza', SEP), m('J35 Bonanza', SEP), m('K35 Bonanza', SEP), m('M35 Bonanza', SEP),
      m('N35 Bonanza', SEP), m('P35 Bonanza', SEP), m('S35 Bonanza', SEP), m('V35 Bonanza', SEP),
      m('V35A Bonanza', SEP), m('V35B Bonanza', SEP),
      m('A36 Bonanza', SEP), m('A36TC Bonanza', SEP), m('B36TC Bonanza', SEP),
      m('G36 Bonanza', SEP),
      // Musketeer / Sport / Sundowner / Sierra
      m('19 Musketeer Sport', SEP), m('23 Musketeer', SEP), m('23 Sundowner', SEP),
      m('24 Musketeer Super', SEP), m('24R Sierra', SEP), m('24 Sierra 200', SEP),
      // Twins
      m('50 Twin Bonanza', MEP), m('55 Baron', MEP), m('55A Baron', MEP), m('55B Baron', MEP),
      m('56TC Baron', MEP), m('58 Baron', MEP), m('58P Baron', MEP), m('58TC Baron', MEP),
      m('G58 Baron', MEP),
      m('95 Travel Air', MEP), m('95-B55 Baron', MEP),
      m('60 Duke', MEP), m('A60 Duke', MEP),
      m('76 Duchess', MEP),
      // King Air turboprops
      m('C90 King Air', MET), m('C90A King Air', MET), m('C90B King Air', MET),
      m('C90GT King Air', MET), m('C90GTi King Air', MET), m('C90GTx King Air', MET),
      m('90 King Air', MET), m('A90 King Air', MET), m('B90 King Air', MET), m('E90 King Air', MET),
      m('F90 King Air', MET),
      m('100 King Air', MET), m('A100 King Air', MET), m('B100 King Air', MET),
      m('200 Super King Air', MET), m('B200 Super King Air', MET), m('B200GT King Air', MET),
      m('250 King Air', MET), m('260 King Air', MET),
      m('300 Super King Air', MET), m('B300 Super King Air', MET),
      m('350 Super King Air', MET), m('350i King Air', MET), m('350ER King Air', MET),
      m('360 King Air', MET),
      // Starship
      m('2000 Starship', MET),
      // Jets
      m('390 Premier I', LJ), m('390 Premier IA', LJ),
      m('400 Beechjet', LJ), m('400A Beechjet', LJ), m('400XP Beechjet', LJ),
      // Military / Warbird
      m('T-6 Texan II', WAR), m('T-34A Mentor', WAR), m('T-34B Mentor', WAR), m('T-34C Mentor', SET),
      m('T-44A Pegasus', MET),
    ],
  },
  {
    make: 'Bellanca',
    models: [
      m('7ECA Citabria', SEP), m('7GCBC Citabria', SEP), m('8KCAB Decathlon', AER),
      m('14-13 Cruisaire', SEP), m('14-13-2 Cruisaire', SEP),
      m('14-19 Cruisemaster', SEP), m('14-19-2 Cruisemaster', SEP), m('14-19-3A Cruisemaster', SEP),
      m('17-30 Viking', SEP), m('17-30A Viking', SEP), m('17-31 Viking', SEP),
      m('17-31A Viking', SEP), m('17-31ATC Turbo Viking', SEP),
    ],
  },
  {
    make: 'Cessna',
    models: [
      // Singles - classic
      m('120', SEP), m('140', SEP), m('140A', SEP),
      m('150', SEP), m('150A', SEP), m('150B', SEP), m('150C', SEP), m('150D', SEP),
      m('150E', SEP), m('150F', SEP), m('150G', SEP), m('150H', SEP),
      m('150J', SEP), m('150K', SEP), m('150L', SEP), m('150M', SEP),
      m('A150K Aerobat', AER), m('A150L Aerobat', AER), m('A150M Aerobat', AER),
      m('152', SEP), m('A152 Aerobat', AER),
      m('162 Skycatcher', LSA),
      m('170', SEP), m('170A', SEP), m('170B', SEP),
      // 172 Skyhawk - all major variants
      m('172', SEP), m('172A', SEP), m('172B', SEP), m('172C', SEP), m('172D', SEP),
      m('172E', SEP), m('172F', SEP), m('172G', SEP), m('172H', SEP), m('172I', SEP),
      m('172K', SEP), m('172L', SEP), m('172M', SEP), m('172N', SEP), m('172P', SEP),
      m('172Q Cutlass', SEP), m('172R Skyhawk', SEP), m('172S Skyhawk SP', SEP),
      m('172RG Cutlass RG', SEP),
      m('T-41 Mescalero', WAR),
      // 175
      m('175 Skylark', SEP), m('175A Skylark', SEP), m('175B Skylark', SEP), m('175C Skylark', SEP),
      // 177 Cardinal
      m('177 Cardinal', SEP), m('177A Cardinal', SEP), m('177B Cardinal', SEP),
      m('177RG Cardinal RG', SEP),
      // 180 / 185
      m('180 Skywagon', SEP), m('180A', SEP), m('180B', SEP), m('180C', SEP),
      m('180D', SEP), m('180E', SEP), m('180F', SEP), m('180G', SEP),
      m('180H', SEP), m('180J', SEP), m('180K', SEP),
      m('185 Skywagon', SEP), m('185A', SEP), m('185B', SEP), m('185C', SEP),
      m('185D', SEP), m('185E', SEP), m('A185E', SEP), m('A185F', SEP),
      // 182 Skylane - all variants
      m('182 Skylane', SEP), m('182A', SEP), m('182B', SEP), m('182C', SEP),
      m('182D', SEP), m('182E', SEP), m('182F', SEP), m('182G', SEP),
      m('182H', SEP), m('182J Skylane', SEP), m('182K Skylane', SEP), m('182L Skylane', SEP),
      m('182M Skylane', SEP), m('182N Skylane', SEP), m('182P Skylane', SEP),
      m('182Q Skylane', SEP), m('182R Skylane', SEP), m('182S Skylane', SEP),
      m('182T Skylane', SEP),
      m('182RG Skylane RG', SEP),
      m('T182 Turbo Skylane', SEP), m('T182T Turbo Skylane', SEP),
      // 190 / 195
      m('190', SEP), m('195', SEP), m('195A', SEP), m('195B', SEP),
      // 205 / 206 / 207 / 208
      m('205', SEP), m('205A', SEP),
      m('206 Stationair', SEP), m('U206 Stationair', SEP), m('P206 Super Skylane', SEP),
      m('T206H Turbo Stationair', SEP), m('206H Stationair', SEP),
      m('207 Stationair 7', SEP), m('207 Skywagon', SEP), m('T207 Turbo Stationair 7', SEP),
      m('208 Caravan', SET), m('208A Caravan 675', SET), m('208B Grand Caravan', SET),
      m('208B Grand Caravan EX', SET),
      // 210 Centurion
      m('210 Centurion', SEP), m('210A', SEP), m('210B', SEP), m('210C', SEP),
      m('210D', SEP), m('210E', SEP), m('210F', SEP), m('210G', SEP),
      m('210H', SEP), m('210J', SEP), m('210K', SEP), m('210L', SEP),
      m('210M', SEP), m('210N', SEP), m('210R', SEP),
      m('P210N Pressurized Centurion', SEP), m('P210R Pressurized Centurion', SEP),
      m('T210F Turbo Centurion', SEP), m('T210G Turbo Centurion', SEP),
      m('T210H Turbo Centurion', SEP), m('T210J Turbo Centurion', SEP),
      m('T210K Turbo Centurion', SEP), m('T210L Turbo Centurion', SEP),
      m('T210M Turbo Centurion', SEP), m('T210N Turbo Centurion', SEP),
      m('T210R Turbo Centurion', SEP),
      // Twins
      m('303 Crusader', MEP),
      m('310', MEP), m('310A', MEP), m('310B', MEP), m('310C', MEP), m('310D', MEP),
      m('310F', MEP), m('310G', MEP), m('310H', MEP), m('310I', MEP),
      m('310J', MEP), m('310K', MEP), m('310L', MEP), m('310N', MEP),
      m('310P', MEP), m('310Q', MEP), m('310R', MEP),
      m('T310P', MEP), m('T310Q', MEP), m('T310R', MEP),
      m('320 Skyknight', MEP), m('320A', MEP), m('320B', MEP), m('320C', MEP),
      m('320D Executive Skyknight', MEP), m('320E Executive Skyknight', MEP),
      m('320F Executive Skyknight', MEP),
      m('335', MEP), m('340', MEP), m('340A', MEP),
      m('336 Skymaster', MEP), m('337 Skymaster', MEP), m('337A', MEP), m('337B', MEP),
      m('337C', MEP), m('337D', MEP), m('337F', MEP), m('337G', MEP), m('337H', MEP),
      m('T337B Turbo Skymaster', MEP), m('T337G Turbo Skymaster', MEP),
      m('P337H Pressurized Skymaster', MEP),
      m('401', MEP), m('401A', MEP), m('401B', MEP),
      m('402', MEP), m('402A', MEP), m('402B', MEP), m('402C', MEP),
      m('404 Titan', MEP), m('411', MEP), m('411A', MEP),
      m('414', MEP), m('414A Chancellor', MEP),
      m('421 Golden Eagle', MEP), m('421A Golden Eagle', MEP), m('421B Golden Eagle', MEP),
      m('421C Golden Eagle', MEP),
      // Turboprops
      m('425 Conquest I', MET), m('441 Conquest II', MET),
      // Jets - Citation line
      m('500 Citation I', LJ), m('501 Citation I/SP', LJ),
      m('510 Citation Mustang', VLJ),
      m('525 CitationJet', LJ), m('525A CJ2', LJ), m('525A CJ2+', LJ),
      m('525B CJ3', LJ), m('525B CJ3+', LJ), m('525C CJ4', LJ),
      m('550 Citation II', LJ), m('550 Citation Bravo', LJ),
      m('S550 Citation S/II', LJ),
      m('560 Citation V', MJ), m('560 Citation Ultra', MJ), m('560 Citation Encore', MJ),
      m('560 Citation Encore+', MJ),
      m('560XL Citation Excel', MJ), m('560XL Citation XLS', MJ), m('560XL Citation XLS+', MJ),
      m('650 Citation III', MJ), m('650 Citation VI', MJ), m('650 Citation VII', MJ),
      m('680 Citation Sovereign', MJ), m('680 Citation Sovereign+', MJ),
      m('680A Citation Latitude', MJ),
      m('700 Citation Longitude', MJ),
      m('750 Citation X', HJ), m('750 Citation X+', HJ),
    ],
  },
  {
    make: 'Cirrus',
    models: [
      m('SR20', SEP), m('SR20 G2', SEP), m('SR20 G3', SEP), m('SR20 G6', SEP), m('SR20 G7', SEP),
      m('SR22', SEP), m('SR22 G2', SEP), m('SR22 G3', SEP), m('SR22 G5', SEP), m('SR22 G6', SEP), m('SR22 G7', SEP),
      m('SR22T', SEP), m('SR22T G5', SEP), m('SR22T G6', SEP), m('SR22T G7', SEP),
      m('SF50 Vision Jet', VLJ), m('SF50 Vision Jet G2', VLJ), m('SF50 Vision Jet G2+', VLJ),
    ],
  },
  {
    make: 'Commander',
    models: [
      m('112', SEP), m('112A', SEP), m('112B', SEP), m('112TC', SEP), m('112TCA', SEP),
      m('114', SEP), m('114A', SEP), m('114B', SEP), m('114TC', SEP),
      m('115 Grand Commander', MEP),
      m('500 Shrike Commander', MEP), m('500S Shrike Commander', MEP),
      m('680 Super', MEP), m('690 Jetprop', MET), m('690A Jetprop', MET),
      m('690B Jetprop 840', MET), m('690C Jetprop 900', MET),
      m('695 Jetprop 980', MET), m('695A Jetprop 1000', MET),
      m('700 Commander Jet', LJ),
    ],
  },
  {
    make: 'CubCrafters',
    models: [
      m('CC-11 Sport Cub', LSA), m('CC-11-100 Sport Cub', LSA),
      m('CC-18-180 Top Cub', SEP),
      m('CCK-1865 Carbon Cub SS', SEP), m('CC-19 XCub', SEP),
      m('CCX-2000 NX Cub', SEP), m('CC-21 Cub', SEP),
      m('Carbon Cub FX-3', LSA), m('Carbon Cub EX-3', EXP),
    ],
  },
  {
    make: 'Daher',
    models: [
      m('TBM 700', SET), m('TBM 700A', SET), m('TBM 700B', SET), m('TBM 700C2', SET),
      m('TBM 850', SET), m('TBM 900', SET), m('TBM 910', SET),
      m('TBM 930', SET), m('TBM 940', SET), m('TBM 960', SET),
      m('Kodiak 100', SET), m('Kodiak 100 Series II', SET), m('Kodiak 100 Series III', SET),
      m('Kodiak 900', SET),
    ],
  },
  {
    make: 'De Havilland',
    models: [
      m('DHC-1 Chipmunk', SEP), m('DHC-2 Beaver', SEP), m('DHC-2 Turbo Beaver', SET),
      m('DHC-2T Turbo Beaver', SET),
      m('DHC-3 Otter', SEP), m('DHC-3T Turbo Otter', SET),
      m('DHC-6 Twin Otter', MET), m('DHC-6-100 Twin Otter', MET),
      m('DHC-6-200 Twin Otter', MET), m('DHC-6-300 Twin Otter', MET),
      m('DHC-6-400 Twin Otter', MET),
    ],
  },
  {
    make: 'Diamond',
    models: [
      m('DA20-A1 Katana', SEP), m('DA20-C1 Eclipse', SEP),
      m('DA40 Diamond Star', SEP), m('DA40 CS', SEP), m('DA40 NG', SEP), m('DA40 XLT', SEP),
      m('DA42 Twin Star', MEP), m('DA42-VI Twin Star', MEP), m('DA42 NG', MEP),
      m('DA50 RG', SEP), m('DA50 Magnum', SEP),
      m('DA62', MEP), m('DA62 MPP', MEP),
      m('DART-550', AER),
    ],
  },
  {
    make: 'Eclipse',
    models: [
      m('500', VLJ), m('550', VLJ),
    ],
  },
  {
    make: 'Embraer',
    models: [
      m('EMB-500 Phenom 100', VLJ), m('EMB-505 Phenom 300', LJ), m('EMB-505 Phenom 300E', LJ),
      m('EMB-545 Praetor 500', MJ), m('EMB-550 Praetor 600', MJ),
      m('EMB-135BJ Legacy 600', HJ), m('EMB-135BJ Legacy 650', HJ), m('EMB-135BJ Legacy 650E', HJ),
      m('EMB-110 Bandeirante', MET), m('EMB-120 Brasilia', MET),
      m('EMB-312 Tucano', WAR),
    ],
  },
  {
    make: 'Epic',
    models: [
      m('E1000 GX', SET), m('LT', EXP), m('Dynasty', EXP),
    ],
  },
  {
    make: 'Ercoupe',
    models: [
      m('415-C', SEP), m('415-CD', SEP), m('415-D', SEP),
      m('415-E', SEP), m('415-G', SEP),
    ],
  },
  {
    make: 'Extra',
    models: [
      m('200', AER), m('230', AER), m('260', AER),
      m('300', AER), m('300L', AER), m('300LT', AER),
      m('330LT', AER), m('330SC', AER),
    ],
  },
  {
    make: 'Glasair',
    models: [
      m('Sportsman', EXP), m('Sportsman 2+2', EXP),
      m('GlaStar', EXP), m('GlaStar GS-1', EXP),
      m('Merlin', EXP), m('III', EXP), m('Super II-S', EXP),
    ],
  },
  {
    make: 'Globe',
    models: [
      m('GC-1B Swift', SEP),
    ],
  },
  {
    make: 'Grumman',
    models: [
      m('AA-1 Yankee', SEP), m('AA-1A Trainer', SEP), m('AA-1B Trainer', SEP),
      m('AA-1C Lynx', SEP),
      m('AA-5 Traveler', SEP), m('AA-5A Cheetah', SEP), m('AA-5B Tiger', SEP),
      m('AG-5B Tiger', SEP),
      m('GA-7 Cougar', MEP),
      m('G-21 Goose', AMP), m('G-44 Widgeon', AMP), m('G-73 Mallard', AMP),
      m('HU-16 Albatross', AMP),
    ],
  },
  {
    make: 'Gulfstream',
    models: [
      m('G100 Astra SPX', MJ), m('G150', MJ),
      m('G200 Galaxy', MJ), m('G280', MJ),
      m('GIV', HJ), m('GIV-SP', HJ), m('G400', HJ), m('G450', HJ),
      m('GV', HJ), m('GV-SP', HJ), m('G500', HJ), m('G550', HJ),
      m('G600', HJ), m('G650', HJ), m('G650ER', HJ),
      m('G700', HJ), m('G800', HJ),
      m('AA-5B Tiger', SEP), m('GA-7 Cougar', MEP),
    ],
  },
  {
    make: 'Helio',
    models: [
      m('H-250 Courier', SEP), m('H-295 Courier', SEP), m('H-395 Courier', SEP),
      m('H-700', SEP), m('H-800 Courier', SEP),
    ],
  },
  {
    make: 'Honda',
    models: [
      m('HA-420 HondaJet', VLJ), m('HA-420 HondaJet Elite', VLJ),
      m('HA-420 HondaJet Elite S', VLJ), m('HondaJet 2600', LJ),
    ],
  },
  {
    make: 'Lake',
    models: [
      m('LA-4 Buccaneer', AMP), m('LA-4-200 Buccaneer', AMP),
      m('LA-250 Renegade', AMP), m('LA-270 Turbo Renegade', AMP),
    ],
  },
  {
    make: 'Lancair',
    models: [
      m('235', EXP), m('320', EXP), m('360', EXP),
      m('ES', EXP), m('IV', EXP), m('IV-P', EXP),
      m('Legacy', EXP), m('Evolution', SET),
      m('Mako', EXP), m('Barracuda', EXP),
    ],
  },
  {
    make: 'Luscombe',
    models: [
      m('8 Silvaire', SEP), m('8A Silvaire', SEP), m('8E Silvaire', SEP),
      m('8F Silvaire', SEP), m('T8F Silvaire', SEP), m('11 Sedan', SEP),
    ],
  },
  {
    make: 'Maule',
    models: [
      m('M-4 Jetasen', SEP), m('M-4-210C Rocket', SEP), m('M-4-220C Strata Rocket', SEP),
      m('M-5-180C Lunar Rocket', SEP), m('M-5-210C Lunar Rocket', SEP),
      m('M-5-235C Lunar Rocket', SEP),
      m('M-6-235 Super Rocket', SEP), m('M-7-235 Super Rocket', SEP),
      m('M-7-235B', SEP), m('M-7-235C', SEP), m('M-7-260', SEP), m('M-7-260C', SEP),
      m('M-7-420AC', SEP), m('MX-7-180 Star Rocket', SEP), m('MX-7-180A', SEP),
      m('MX-7-235 Star Rocket', SEP),
      m('M-8 Super Rocket', SEP), m('M-9-235 Orion', SEP), m('MT-7-235', SEP),
      m('MXT-7-180 Star Rocket', SEP), m('MXT-7-180A Comet', SEP),
    ],
  },
  {
    make: 'Mooney',
    models: [
      m('M20 Mark 20', SEP), m('M20A', SEP), m('M20B Mark 21', SEP),
      m('M20C Mark 21', SEP), m('M20C Ranger', SEP),
      m('M20D Master', SEP), m('M20E Super 21', SEP), m('M20E Chaparral', SEP),
      m('M20F Executive 21', SEP), m('M20G Statesman', SEP),
      m('M20J 201', SEP), m('M20J 201SE', SEP), m('M20J MSE', SEP),
      m('M20K 231', SEP), m('M20K 252TSE', SEP), m('M20K Encore', SEP),
      m('M20L PFM', SEP),
      m('M20M TLS', SEP), m('M20M Bravo', SEP),
      m('M20R Ovation', SEP), m('M20R Ovation2 GX', SEP), m('M20R Ovation3', SEP),
      m('M20S Eagle', SEP), m('M20S Eagle2', SEP),
      m('M20T Acclaim', SEP), m('M20T Acclaim Type S', SEP),
      m('M20U Ovation Ultra', SEP), m('M20V Acclaim Ultra', SEP),
      m('M10T', SEP), m('M10J', SEP),
    ],
  },
  {
    make: 'North American',
    models: [
      m('Navion', SEP), m('Navion A', SEP), m('Navion B', SEP), m('Navion G', SEP),
      m('Navion Rangemaster', SEP),
      m('T-6 Texan', WAR), m('SNJ Texan', WAR),
      m('T-28A Trojan', WAR), m('T-28B Trojan', WAR), m('T-28C Trojan', WAR),
      m('P-51D Mustang', WAR), m('P-51K Mustang', WAR),
      m('B-25 Mitchell', WAR),
    ],
  },
  {
    make: 'Pilatus',
    models: [
      m('PC-6 Porter', SET), m('PC-6 Turbo Porter', SET),
      m('PC-7', SET), m('PC-9', SET), m('PC-21', SET),
      m('PC-12/45', SET), m('PC-12/47', SET), m('PC-12/47E', SET),
      m('PC-12 NG', SET), m('PC-12 NGX', SET),
      m('PC-24', LJ),
    ],
  },
  {
    make: 'Piper',
    models: [
      // Cubs / classics
      m('J-2 Cub', SEP), m('J-3 Cub', SEP), m('J-4 Cub Coupe', SEP), m('J-5 Cruiser', SEP),
      m('PA-11 Cub Special', SEP), m('PA-12 Super Cruiser', SEP),
      m('PA-14 Family Cruiser', SEP), m('PA-15 Vagabond', SEP),
      m('PA-16 Clipper', SEP), m('PA-17 Vagabond', SEP),
      m('PA-18 Super Cub', SEP), m('PA-18-90', SEP), m('PA-18-95', SEP),
      m('PA-18-105', SEP), m('PA-18-135', SEP), m('PA-18-150', SEP),
      m('PA-20 Pacer', SEP), m('PA-22 Tri-Pacer', SEP), m('PA-22-108 Colt', SEP),
      m('PA-22-135 Tri-Pacer', SEP), m('PA-22-150 Tri-Pacer', SEP), m('PA-22-160 Tri-Pacer', SEP),
      // Cherokee / Warrior / Archer / Arrow
      m('PA-28-140 Cherokee', SEP), m('PA-28-150 Cherokee', SEP), m('PA-28-151 Warrior', SEP),
      m('PA-28-160 Cherokee', SEP), m('PA-28-161 Warrior II', SEP), m('PA-28-161 Warrior III', SEP),
      m('PA-28-180 Cherokee', SEP), m('PA-28-181 Archer', SEP), m('PA-28-181 Archer II', SEP),
      m('PA-28-181 Archer III', SEP), m('PA-28-181 Archer LX', SEP), m('PA-28-181 Archer DLX', SEP),
      m('PA-28-201T Turbo Dakota', SEP), m('PA-28-235 Cherokee', SEP), m('PA-28-236 Dakota', SEP),
      m('PA-28R-180 Cherokee Arrow', SEP), m('PA-28R-200 Arrow', SEP), m('PA-28R-200 Arrow II', SEP),
      m('PA-28R-201 Arrow III', SEP), m('PA-28R-201T Turbo Arrow III', SEP),
      m('PA-28RT-201 Arrow IV', SEP), m('PA-28RT-201T Turbo Arrow IV', SEP),
      // Comanche
      m('PA-24-180 Comanche', SEP), m('PA-24-250 Comanche', SEP), m('PA-24-260 Comanche', SEP),
      m('PA-24-260B Comanche', SEP), m('PA-24-260C Comanche', SEP), m('PA-24-400 Comanche', SEP),
      // Cherokee Six / Saratoga / Lance
      m('PA-32-260 Cherokee Six', SEP), m('PA-32-300 Cherokee Six', SEP),
      m('PA-32-301 Saratoga', SEP), m('PA-32-301T Turbo Saratoga', SEP),
      m('PA-32R-300 Lance', SEP), m('PA-32R-301 Saratoga SP', SEP),
      m('PA-32R-301T Turbo Saratoga SP', SEP), m('PA-32R-301T Saratoga II TC', SEP),
      // Tomahawk
      m('PA-38-112 Tomahawk', SEP),
      // Twins
      m('PA-23-150 Apache', MEP), m('PA-23-160 Apache', MEP),
      m('PA-23-235 Apache', MEP), m('PA-23-250 Aztec', MEP),
      m('PA-23-250 Aztec C', MEP), m('PA-23-250 Aztec D', MEP),
      m('PA-23-250 Aztec E', MEP), m('PA-23-250 Aztec F', MEP),
      m('PA-30 Twin Comanche', MEP), m('PA-39 Twin Comanche CR', MEP),
      m('PA-34-200 Seneca', MEP), m('PA-34-200T Seneca II', MEP),
      m('PA-34-220T Seneca III', MEP), m('PA-34-220T Seneca IV', MEP),
      m('PA-34-220T Seneca V', MEP),
      m('PA-44-180 Seminole', MEP), m('PA-44-180T Turbo Seminole', MEP),
      m('PA-31 Navajo', MEP), m('PA-31-300 Navajo', MEP), m('PA-31-310 Navajo', MEP),
      m('PA-31-325 Navajo CR', MEP), m('PA-31-350 Chieftain', MEP),
      m('PA-31P Pressurized Navajo', MEP),
      m('PA-31T Cheyenne', MET), m('PA-31T1 Cheyenne I', MET),
      m('PA-31T2 Cheyenne IIXL', MET),
      m('PA-42 Cheyenne III', MET), m('PA-42-720 Cheyenne IIIA', MET),
      m('PA-42-1000 Cheyenne 400', MET),
      // Malibu / Meridian / M-class
      m('PA-46-310P Malibu', SEP), m('PA-46-350P Mirage', SEP),
      m('PA-46R-350T Matrix', SEP),
      m('PA-46-500TP Malibu Meridian', SET), m('PA-46-500TP M500', SET),
      m('PA-46-600TP M600', SET), m('PA-46-600TP M600 SLS', SET),
      m('M350', SEP), m('M500', SET), m('M600', SET), m('M600 SLS', SET),
    ],
  },
  {
    make: 'Pipistrel',
    models: [
      m('Alpha Trainer', LSA), m('Alpha Electro', LSA),
      m('Virus SW', LSA), m('Virus SW 80', LSA), m('Virus SW 100', LSA),
      m('Sinus', LSA), m('Panthera', SEP),
      m('Velis Electro', LSA),
    ],
  },
  {
    make: 'Quest',
    models: [
      m('Kodiak 100', SET), m('Kodiak 100 Series II', SET),
    ],
  },
  {
    make: 'Republic',
    models: [
      m('RC-3 Seabee', AMP),
    ],
  },
  {
    make: 'Robinson',
    models: [
      m('R22 Beta', HEL), m('R22 Beta II', HEL), m('R22 Mariner', HEL),
      m('R44 Raven', HEL), m('R44 Raven I', HEL), m('R44 Raven II', HEL),
      m('R44 Clipper', HEL), m('R44 Clipper II', HEL), m('R44 Cadet', HEL),
      m('R66 Turbine', HEL), m('R66 Turbine Marine', HEL),
    ],
  },
  {
    make: 'Socata',
    models: [
      m('TB-9 Tampico', SEP), m('TB-10 Tobago', SEP), m('TB-200 Tobago XL', SEP),
      m('TB-20 Trinidad', SEP), m('TB-21 Trinidad TC', SEP),
      m('MS 880 Rallye', SEP), m('MS 893 Rallye', SEP), m('MS 894 Rallye', SEP),
      m('TBM 700', SET),
    ],
  },
  {
    make: 'Stinson',
    models: [
      m('108 Voyager', SEP), m('108-1 Voyager', SEP), m('108-2 Voyager', SEP),
      m('108-3 Voyager', SEP), m('V-77 Reliant', SEP), m('SR-10 Reliant', SEP),
      m('L-5 Sentinel', WAR),
    ],
  },
  {
    make: 'Taylorcraft',
    models: [
      m('BC-12D', SEP), m('BC-12D-85', SEP), m('BC-65', SEP),
      m('F-19 Sportsman', SEP), m('F-21 Sportsman', SEP), m('F-21A', SEP), m('F-21B', SEP),
      m('F-22', SEP), m('F-22A', SEP), m('F-22B', SEP), m('F-22C', SEP),
    ],
  },
  {
    make: 'Tecnam',
    models: [
      m('P92 Echo', LSA), m('P92 Eaglet', LSA), m('P92 Tail Dragger', LSA),
      m('P2002 Sierra', LSA), m('P2002 Sierra RG', LSA),
      m('P2006T', MEP), m('P2006T MkII', MEP),
      m('P2008', LSA), m('P2008JC', LSA),
      m('P2010', SEP), m('P2010 TDI', SEP), m('P2012 Traveller', MEP),
    ],
  },
  {
    make: 'Textron Aviation',
    models: [
      m('Cessna Denali', SET), m('Beechcraft Denali', SET),
      m('Cessna SkyCourier', MET),
    ],
  },
  {
    make: 'Van\'s Aircraft',
    models: [
      m('RV-3', EXP), m('RV-3B', EXP),
      m('RV-4', EXP), m('RV-6', EXP), m('RV-6A', EXP),
      m('RV-7', EXP), m('RV-7A', EXP), m('RV-8', EXP), m('RV-8A', EXP),
      m('RV-9', EXP), m('RV-9A', EXP),
      m('RV-10', EXP), m('RV-12', EXP), m('RV-12iS', EXP),
      m('RV-14', EXP), m('RV-14A', EXP), m('RV-15', EXP),
    ],
  },
  {
    make: 'Waco',
    models: [
      m('YMF-5', SEP), m('YMF Super', SEP), m('UPF-7', SEP), m('Great Lakes 2T-1A', AER),
    ],
  },
  {
    make: 'Dassault',
    models: [
      m('Falcon 10', MJ), m('Falcon 20', MJ), m('Falcon 50', HJ), m('Falcon 50EX', HJ),
      m('Falcon 100', MJ), m('Falcon 200', MJ),
      m('Falcon 900', HJ), m('Falcon 900B', HJ), m('Falcon 900C', HJ),
      m('Falcon 900DX', HJ), m('Falcon 900EX', HJ), m('Falcon 900EX EASy', HJ),
      m('Falcon 900LX', HJ), m('Falcon 900LX EASy', HJ),
      m('Falcon 2000', HJ), m('Falcon 2000EX', HJ), m('Falcon 2000EX EASy', HJ),
      m('Falcon 2000LX', HJ), m('Falcon 2000LXS', HJ), m('Falcon 2000S', HJ),
      m('Falcon 7X', HJ), m('Falcon 8X', HJ),
      m('Falcon 6X', HJ), m('Falcon 10X', HJ),
    ],
  },
  {
    make: 'Bombardier',
    models: [
      m('Learjet 23', LJ), m('Learjet 24', LJ), m('Learjet 25', LJ),
      m('Learjet 31', LJ), m('Learjet 31A', LJ),
      m('Learjet 35', LJ), m('Learjet 35A', LJ), m('Learjet 36', LJ), m('Learjet 36A', LJ),
      m('Learjet 40', LJ), m('Learjet 40XR', LJ),
      m('Learjet 45', MJ), m('Learjet 45XR', MJ),
      m('Learjet 55', MJ), m('Learjet 60', MJ), m('Learjet 60XR', MJ),
      m('Learjet 70', MJ), m('Learjet 75', MJ), m('Learjet 75 Liberty', MJ),
      m('Challenger 300', HJ), m('Challenger 350', HJ),
      m('Challenger 601', HJ), m('Challenger 604', HJ), m('Challenger 605', HJ),
      m('Challenger 650', HJ),
      m('Global 5000', HJ), m('Global 5500', HJ),
      m('Global 6000', HJ), m('Global 6500', HJ),
      m('Global 7500', HJ), m('Global 8000', HJ),
      m('Global Express', HJ), m('Global Express XRS', HJ),
    ],
  },
  {
    make: 'SyberJet',
    models: [
      m('SJ30', VLJ), m('SJ30-2', VLJ),
    ],
  },
];

// ---- Derived helpers ----

/** Sorted list of all aircraft makes */
export const ALL_MAKES = AIRCRAFT_DATABASE.map((entry) => entry.make).sort();

/** Get all categories that a given make has aircraft in */
export function getCategoriesForMake(make: string): string[] {
  const entry = AIRCRAFT_DATABASE.find((e) => e.make === make);
  if (!entry) return [];
  return Array.from(new Set(entry.models.map((m) => m.category))).sort();
}

/** Get makes that have at least one model in the given category */
export function getMakesForCategory(category: string): string[] {
  return AIRCRAFT_DATABASE
    .filter((entry) => entry.models.some((m) => m.category === category))
    .map((entry) => entry.make)
    .sort();
}

/** Get models for a make, optionally filtered by category */
export function getModelsForMake(make: string, category?: string): string[] {
  const entry = AIRCRAFT_DATABASE.find((e) => e.make === make);
  if (!entry) return [];
  let models = entry.models;
  if (category) {
    models = models.filter((m) => m.category === category);
  }
  return models.map((m) => m.model).sort();
}
