// 25-element array required for Material UI shadows structure.
// Customized the first few levels to use clean, modern, soft slate-colored shadows.
const shadows = [
  'none',
  '0px 1px 2px 0px rgba(15, 23, 42, 0.05)',
  '0px 2px 4px 0px rgba(15, 23, 42, 0.05)',
  '0px 4px 6px -1px rgba(15, 23, 42, 0.05), 0px 2px 4px -2px rgba(15, 23, 42, 0.05)',
  '0px 10px 15px -3px rgba(15, 23, 42, 0.05), 0px 4px 6px -4px rgba(15, 23, 42, 0.05)',
  '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 8px 10px -6px rgba(15, 23, 42, 0.1)',
  ...Array(19).fill('none')
];

export default shadows;
