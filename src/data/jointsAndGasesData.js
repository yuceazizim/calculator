/**
 * Welding Consumable Calculator (WCC)
 * Engineering Catalog: Standard Joint Geometries, Shielding/Purge Gases & Welding Processes
 * Standards: ASME B16.25 • ASME Sec. IX • ISO 4063 • EN ISO 15614-1
 * Pure JavaScript (.js only)
 */

export const JOINT_GEOMETRIES = [
  {
    id: 'joint-single-v',
    joint_code: 'single_v_groove',
    joint_name: 'Single V-Groove BW',
    i18n_key: 'joint.single_v',
    default_bevel_angle_deg: 37.5,
    default_root_gap_mm: 2.50,
    default_root_face_mm: 1.60,
    default_cap_height_mm: 1.50,
  },
  {
    id: 'joint-single-v-72',
    joint_code: 'single_v_72',
    joint_name: 'Standard V-Groove 72 Deg BW',
    i18n_key: 'joint.single_v_72',
    default_bevel_angle_deg: 36.0,
    default_root_gap_mm: 3.00,
    default_root_face_mm: 1.00,
    default_cap_height_mm: 1.50,
  },
  {
    id: 'joint-double-v',
    joint_code: 'double_v_groove',
    joint_name: 'Double V-Groove X-Joint',
    i18n_key: 'joint.double_v',
    default_bevel_angle_deg: 35.0,
    default_root_gap_mm: 2.00,
    default_root_face_mm: 2.00,
    default_cap_height_mm: 1.50,
  },
  {
    id: 'joint-square-butt',
    joint_code: 'square_butt',
    joint_name: 'Square Butt Joint',
    i18n_key: 'joint.square_butt',
    default_bevel_angle_deg: 0.0,
    default_root_gap_mm: 2.00,
    default_root_face_mm: 0.00,
    default_cap_height_mm: 1.00,
  },
];

export const SHIELDING_GASES = [
  {
    id: 'gas-pure-argon',
    gas_name: 'Pure Argon 99.995%',
    i18n_key: 'gas.pure_argon',
    gas_type: 'inert',
    cylinder_water_volume_liter: 50.0,
    cylinder_pressure_bar: 150.0,
    free_gas_volume_m3: 6.00,
    recommended_flow_rate_min: 10.0,
    recommended_flow_rate_max: 16.0,
  },
  {
    id: 'gas-arcal-12',
    gas_name: 'Arcal 12 (82% Ar + 18% CO2)',
    i18n_key: 'gas.arcal_12',
    gas_type: 'mixture',
    cylinder_water_volume_liter: 50.0,
    cylinder_pressure_bar: 200.0,
    free_gas_volume_m3: 10.00,
    recommended_flow_rate_min: 12.0,
    recommended_flow_rate_max: 16.0,
  },
  {
    id: 'gas-forming-gas',
    gas_name: 'Forming Gas (95% N2 + 5% H2)',
    i18n_key: 'gas.forming_gas',
    gas_type: 'purge',
    cylinder_water_volume_liter: 50.0,
    cylinder_pressure_bar: 200.0,
    free_gas_volume_m3: 10.00,
    recommended_flow_rate_min: 10.0,
    recommended_flow_rate_max: 15.0,
  },
  {
    id: 'gas-pure-co2',
    gas_name: 'Pure CO2',
    i18n_key: 'gas.pure_co2',
    gas_type: 'active',
    cylinder_water_volume_liter: 50.0,
    cylinder_pressure_bar: 50.0,
    free_gas_volume_m3: 6.00,
    recommended_flow_rate_min: 14.0,
    recommended_flow_rate_max: 18.0,
  },
];

export const WELDING_PROCESSES = [
  {
    process_code: 'GTAW',
    iso_number: 141,
    process_name: 'Gas Tungsten Arc Welding TIG',
    default_efficiency: 0.95,
    thermal_efficiency_k: 0.60,
  },
  {
    process_code: 'SMAW',
    iso_number: 111,
    process_name: 'Shielded Metal Arc Welding MMA Stick',
    default_efficiency: 0.60,
    thermal_efficiency_k: 0.80,
  },
  {
    process_code: 'GMAW',
    iso_number: 135,
    process_name: 'Gas Metal Arc Welding MIG MAG',
    default_efficiency: 0.88,
    thermal_efficiency_k: 0.80,
  },
  {
    process_code: 'FCAW',
    iso_number: 136,
    process_name: 'Flux Cored Arc Welding GSFCAW',
    default_efficiency: 0.85,
    thermal_efficiency_k: 0.80,
  },
  {
    process_code: 'SAW',
    iso_number: 121,
    process_name: 'Submerged Arc Welding',
    default_efficiency: 0.99,
    thermal_efficiency_k: 1.00,
  },
];