import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FAB from '../src/Components/FAB.jsx';
import AddModal from '../src/Modal and Sheets/AddModal';
import { SiteVisitSheet } from '../src/Modal and Sheets/SiteVisitSheet';
import VisitFeedbackSheet from '../src/Modal and Sheets/VisitFeedbackSheet';
import FollowUpsList from '../src/Views/FollowUpsList';

// Redux actions
import { addFollowUp, clearActiveSiteVisit, clearShowFeedback, deleteFollowUp, setActiveSiteVisit, setShowFeedback, updateFollowUp, updateFollowUpStatus } from '../src/store/slices/followUpsSlice';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '../src/store/slices/uiSlice';

export default function FollowUps() {
  const dispatch = useDispatch();
  
  const { properties } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { followUps, activeSiteVisit, showFeedback } = useSelector(state => state.followUps);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleFABClick = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  };

  const handleAdd = (data) => {
    const newFollowUp = { ...data, id: generateId() };
    dispatch(addFollowUp(newFollowUp));
    dispatch(setModalOpen(false));
  };

  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = (updatedItem) => {
    dispatch(updateFollowUp(updatedItem));
    dispatch(clearEditItem());
    dispatch(setModalOpen(false));
  };

  const handleUpdateStatus = (id, status) => {
    dispatch(updateFollowUpStatus({ id, status }));
  };

  const handleDelete = (id) => {
    dispatch(deleteFollowUp(id));
  };

  const handleStartVisit = (visitDetails) => {
    dispatch(setActiveSiteVisit(visitDetails));
  };

  const handleFinishVisit = (visitDetails) => {
    dispatch(clearActiveSiteVisit());
    dispatch(setShowFeedback(visitDetails));
  };

  const handleSubmitFeedback = (feedbackData) => {
    // Handle feedback submission logic here
    console.log('Feedback submitted:', feedbackData);
    dispatch(clearShowFeedback());
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <FollowUpsList 
        followUps={followUps} 
        customers={customers} 
        properties={properties} 
        onUpdateStatus={handleUpdateStatus} 
        onDelete={handleDelete} 
        onStartVisit={handleStartVisit} 
      />

      <FAB onClick={handleFABClick} />

      <AddModal 
        isOpen={modalOpen} 
        type={modalType} 
        onClose={() => dispatch(setModalOpen(false))} 
        onSave={handleAdd} 
        onUpdate={handleUpdate} 
        editItem={editItem} 
        properties={properties} 
        customers={customers} 
      />

      {activeSiteVisit && (
        <SiteVisitSheet 
          activeVisit={activeSiteVisit} 
          onClose={() => dispatch(clearActiveSiteVisit())} 
          onFinish={handleFinishVisit} 
        />
      )}

      {showFeedback && (
        <VisitFeedbackSheet 
          visitData={showFeedback} 
          onClose={() => dispatch(clearShowFeedback())} 
          onSubmit={handleSubmitFeedback} 
        />
      )}
    </View>
  );
}