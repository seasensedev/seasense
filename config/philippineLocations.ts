export type LocationData = {
  [region: string]: {
    [province: string]: {
      [city: string]: string[];
    };
  };
};

export const philippineLocations: LocationData = {
  "Region XI (Davao Region)": {
    "Davao del Sur": {
      "Davao City": [
        "Poblacion District",
        "Talomo District",
        "Buhangin District",
        "Toril District",
        "Bunawan District",
      ],
      "Digos": [
        "Zone I",
        "Zone II",
        "Zone III",
      ],
      "Bansalan": [
        "Poblacion",
        "New Clarin",
        "Rizal",
      ],
      "Santa Cruz": [
        "Poblacion",
        "Zone I",
        "Zone II",
        "Zone III",
      ],
      "Hagonoy": [
        "Poblacion",
        "Clib",
        "Guihing",
      ],
      "Malalag": [
        "Poblacion",
        "Baybay",
        "Bulacan",
      ],
      "Padada": [
        "Poblacion",
        "Limonso",
        "Sibulan",
      ],
      "Sulop": [
        "Poblacion",
        "Laperas",
        "Lantawan",
      ],
      "Kiblawan": [
        "Poblacion",
        "Bagong Silang",
        "San Isidro",
      ],
      "Magsaysay": [
        "Poblacion",
        "San Isidro",
        "San Miguel",
      ],
      "Matanao": [
        "Poblacion",
        "Asbang",
        "Savoy",
      ],
    },
    "Davao del Norte": {
      "Tagum": [
        "Apokon",
        "Mankilam",
        "Magugpo",
      ],
      "Panabo": [
        "New Pandan",
        "San Francisco",
        "Gredu",
      ],
      "Samal": [
        "Babak",
        "Kaputian",
        "Peñaplata",
      ],
      "Carmen": [
        "Poblacion",
        "Ising",
        "Tuganay",
      ],
      "Santo Tomas": [
        "Poblacion",
        "Balagunan",
        "San Jose",
      ],
      "Kapalong": [
        "Poblacion",
        "Maniki",
        "Mabuhay",
      ],
      "New Corella": [
        "Poblacion",
        "Del Pilar",
        "San Roque",
      ],
      "Braulio E. Dujali": [
        "Poblacion",
        "Dujali",
        "Tanglaw",
      ],
      "San Isidro": [
        "Poblacion",
        "Datu Balong",
        "Libuton",
      ],
    },
    "Davao Oriental": {
      "Mati": [
        "Central",
        "Dahican",
        "Matiao",
      ],
      "Baganga": [
        "Central",
        "Dapnan",
        "Kinablangan",
      ],
    },
    "Davao de Oro": {
      "Nabunturan": [
        "Poblacion",
        "Magsaysay",
        "San Roque",
      ],
      "Monkayo": [
        "Poblacion",
        "Awao",
        "Oro",
      ],
    },
  },
  "Region X (Northern Mindanao)": {
    "Misamis Oriental": {
      "Cagayan de Oro": [
        "Carmen",
        "Lapasan",
        "Macasandig",
      ],
      "Gingoog": [
        "Barangay 1",
        "Barangay 2",
        "Barangay 3",
      ],
      "El Salvador": [
        "Poblacion",
        "Molugan",
        "Sambulawan",
      ],
      "Opol": [
        "Poblacion",
        "Igpit",
        "Taboc",
      ],
      "Balingasag": [
        "Poblacion",
        "Cogon",
        "Linggangao",
      ],
      "Jasaan": [
        "Poblacion",
        "Aplaya",
        "San Antonio",
      ],
    },
    "Bukidnon": {
      "Malaybalay": [
        "Aglayan",
        "Bangcud",
        "Casisang",
      ],
      "Valencia": [
        "Bagontaas",
        "Lumbo",
        "Poblacion",
      ],
    },
    "Lanao del Norte": {
      "Iligan": [
        "Pala-o",
        "Tibanga",
        "Hinaplanon",
      ],
      "Kapatagan": [
        "Poblacion",
        "Suso",
        "Waterfalls",
      ],
    },
    "Camiguin": {
      "Mambajao": [
        "Poblacion",
        "Yumbing",
        "Agoho",
      ],
      "Catarman": [
        "Poblacion",
        "Bonbon",
        "Mainit",
      ],
    },
    "Misamis Occidental": {
      "Oroquieta": [
        "Poblacion I",
        "Poblacion II",
        "Talic",
      ],
      "Ozamiz": [
        "Aguada",
        "Bacolod",
        "Catadman",
      ],
    },
  },
  "Region XII (SOCCSKSARGEN)": {
    "South Cotabato": {
      "General Santos": [
        "Lagao",
        "San Isidro",
        "Bula",
      ],
      "Koronadal": [
        "Zone I",
        "Zone II",
        "Zone III",
      ],
      "Polomolok": [
        "Poblacion",
        "Cannery Site",
        "Glamang",
      ],
      "Tupi": [
        "Poblacion",
        "Crossing Rubber",
        "Kablon",
      ],
      "Tampakan": [
        "Poblacion",
        "Liberty",
        "Kipalbig",
      ],
      "Norala": [
        "Poblacion",
        "San Miguel",
        "Liberty",
      ],
    },
    "Sultan Kudarat": {
      "Tacurong": [
        "Poblacion",
        "San Emmanuel",
        "New Isabela",
      ],
      "Isulan": [
        "Kalawag I",
        "Kalawag II",
        "Kalawag III",
      ],
    },
    "Sarangani": {
      "Alabel": [
        "Poblacion",
        "Spring",
        "Alegria",
      ],
      "Glan": [
        "Poblacion",
        "Tango",
        "Burias",
      ],
    },
    "Cotabato": {
      "Kidapawan": [
        "Poblacion",
        "Lanao",
        "Balindog",
      ],
      "Midsayap": [
        "Poblacion",
        "Sadaan",
        "Salunayan",
      ],
    },
    "North Cotabato": {
      "Kabacan": [
        "Poblacion",
        "Kayaga",
        "Salapungan",
      ],
      "Matalam": [
        "Poblacion",
        "Kilada",
        "New Bugasong",
      ],
    },
  },
  "Region XIII (Caraga)": {
    "Agusan del Norte": {
      "Butuan": [
        "Ampayon",
        "Baan",
        "Libertad",
      ],
      "Cabadbaran": [
        "Bayabas",
        "Katugasan",
        "Poblacion",
        "Comagascas",
        "Kauswagan",
        "La Union",
        "Poblacion 1",
        "Poblacion 2",
        "Poblacion 3",
      ],
    },
    "Surigao del Norte": {
      "Surigao City": [
        "Taft",
        "San Juan",
        "Washington",
      ],
      "Placer": [
        "Bad-as",
        "Magsaysay",
        "Poblacion",
      ],
    },
    "Surigao del Sur": {
      "Tandag": [
        "Mabua",
        "San Agustin",
        "San Antonio",
      ],
      "Bislig": [
        "Mangagoy",
        "Tabon",
        "San Fernando",
      ],
    },
    "Agusan del Sur": {
      "Bayugan": [
        "Poblacion",
        "Taglatawan",
        "Salvacion",
      ],
      "Prosperidad": [
        "Poblacion",
        "San Vicente",
        "Patin-ay",
      ],
    },
    "Dinagat Islands": {
      "San Jose": [
        "Poblacion",
        "Don Ruben",
        "Jacquez",
      ],
      "Basilisa": [
        "Poblacion",
        "Rizal",
        "San Juan",
      ],
    },
  },
  "BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)": {
    "Maguindanao": {
      "Cotabato City": [
        "Rosary Heights",
        "Poblacion",
        "Bagua",
      ],
      "Datu Odin Sinsuat": [
        "Awang",
        "Dalican",
        "Kakar",
      ],
      "Sultan Kudarat": [
        "Poblacion",
        "Banubo",
        "Dalumangcob",
      ],
      "Parang": [
        "Poblacion",
        "Nituan",
        "Sarmiento",
      ],
      "Buluan": [
        "Poblacion",
        "Digal",
        "Maslabeng",
      ],
      "Datu Paglas": [
        "Poblacion",
        "Damawato",
        "Malala",
      ],
    },
    "Lanao del Sur": {
      "Marawi": [
        "Bangon",
        "Basak Malutlut",
        "Poblacion",
      ],
      "Wao": [
        "Eastern Wao",
        "Western Wao",
        "Poblacion",
      ],
    },
    "Basilan": {
      "Isabela City": [
        "Tabuk",
        "Sunshine",
        "Riverside",
      ],
      "Lamitan": [
        "Malinis",
        "Maganda",
        "Matatag",
      ],
    },
    "Sulu": {
      "Jolo": [
        "Walled City",
        "San Raymundo",
        "Busbus",
      ],
      "Patikul": [
        "Taglibi",
        "Timbangan",
        "Danag",
      ],
    },
    "Tawi-Tawi": {
      "Bongao": [
        "Poblacion",
        "Lamion",
        "Simandagit",
      ],
      "Panglima Sugala": [
        "Poblacion",
        "Balimbing",
        "Lakit-Lakit",
      ],
    },
  },
  "Region IX (Zamboanga Peninsula)": {
    "Zamboanga del Sur": {
      "Zamboanga City": [
        "Santa Maria",
        "Tetuan",
        "Pasonanca",
      ],
      "Pagadian": [
        "Balangasan",
        "San Pedro",
        "Tiguma",
      ],
      "Molave": [
        "Poblacion",
        "Bliss",
        "Culo",
      ],
      "Tukuran": [
        "Poblacion",
        "San Antonio",
        "Tagulo",
      ],
      "Aurora": [
        "Poblacion",
        "Anonang",
        "Bagong Silang",
      ],
      "Labangan": [
        "Poblacion",
        "Combo",
        "Langapod",
      ],
      "Dumalinao": [
        "Poblacion",
        "Bag-ong Misamis",
        "Paglaum",
      ],
      "Tigbao": [
        "Poblacion",
        "Lacupayan",
        "Libayoy",
      ],
    },
    "Zamboanga del Norte": {
      "Dipolog": [
        "Miputak",
        "Sta. Filomena",
        "Turno",
      ],
      "Dapitan": [
        "Dawo",
        "Potol",
        "San Vicente",
      ],
      "Sindangan": [
        "Poblacion",
        "Disud",
        "Goleo",
      ],
      "Roxas": [
        "Poblacion",
        "Villahermosa",
        "Upper Irasan",
      ],
    },
    "Zamboanga Sibugay": {
      "Ipil": [
        "Poblacion",
        "Taway",
        "Don Andres",
      ],
      "Kabasalan": [
        "Poblacion",
        "Salipyasin",
        "Nazareth",
      ],
    },
  },
  "Region VIII (Eastern Visayas)": {
    "Leyte": {
      "Tacloban": [
        "San Jose",
        "Downtown",
        "V&G Subdivision",
      ],
      "Ormoc": [
        "Cogon",
        "Linao",
        "San Isidro",
      ],
    },
    "Samar": {
      "Calbayog": [
        "Barangay 1",
        "Barangay 2",
        "Barangay 3",
      ],
      "Catbalogan": [
        "Barangay 4",
        "Barangay 5",
        "Barangay 6",
      ],
    },
  },
  // ... other regions
};
