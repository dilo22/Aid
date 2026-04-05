export function formatPrice(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function formatWeight(value) {
  if (!value) return '-';
  return `${value} kg`;
}

export function getInitialSheepForm() {
  return {
    number: '',
    size: 'medium',
    weight: '',
    price: '',
    status: 'available',
    organization_id: '',
    notes: '',
  };
}