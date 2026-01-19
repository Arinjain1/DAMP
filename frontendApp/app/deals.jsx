import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DealSheet from '../src/Modal and Sheets/DealSheet';
import DealsManagerPage from '../src/Views/DealsManagerPage';

// Redux actions
import { clearSelectedDeal, closeDeal, setSelectedDeal, updateDeal } from '../src/store/slices/dealsSlice';
import { addFollowUp } from '../src/store/slices/followUpsSlice';

export default function Deals() {
  const dispatch = useDispatch();
  
  const { properties } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { deals, selectedDeal } = useSelector(state => state.deals);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleUpdateDeal = (id, updatedDeal) => {
    dispatch(updateDeal({ id, deal: updatedDeal }));
  };

  const handleCloseDeal = (deal) => {
    dispatch(closeDeal(deal.id));
  };

  const handleAddTask = (task) => {
    dispatch(addFollowUp({ ...task, id: generateId() }));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <DealsManagerPage 
        deals={deals} 
        properties={properties} 
        customers={customers} 
        onOpenDeal={(deal) => dispatch(setSelectedDeal(deal))} 
      />

      {selectedDeal && (
        <DealSheet 
          deal={selectedDeal} 
          properties={properties} 
          customers={customers} 
          onClose={() => dispatch(clearSelectedDeal())} 
          onUpdateDeal={handleUpdateDeal} 
          onCloseDeal={handleCloseDeal}
          onAddTask={handleAddTask}
        />
      )}
    </View>
  );
}