import ModulePage from '../../components/ModulePage';
import { moduleConfigs } from '../../config/modules';

const createModulePage = (key) => {
  const config = moduleConfigs[key];
  return () => <ModulePage {...config} />;
};

export const FarmsPage = createModulePage('farms');
export const CowsPage = createModulePage('cows');
export const GoatsPage = createModulePage('goats');
export const PoultryPage = createModulePage('poultry');
export const FeedPage = createModulePage('feed');
export const MilkPage = createModulePage('milk');
export const EggsPage = createModulePage('eggs');
export const HealthPage = createModulePage('health');
export const VaccinationsPage = createModulePage('vaccinations');
export const BreedingPage = createModulePage('breeding');
export const SalesPage = createModulePage('sales');
export const CustomersPage = createModulePage('customers');
export const ExpensesPage = createModulePage('expenses');
export const IncomePage = createModulePage('income');
