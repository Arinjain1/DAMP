import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Views
import Dashboard from "../src/Views/Dashboard";

// Components & Sheets
import FAB from "../src/Components/FAB";
import AddModal from "../src/Modal and Sheets/AddModal";
import CollaborationSheet from "../src/Modal and Sheets/CollaborationSheet";
import CustomerDetailSheet from "../src/Modal and Sheets/CustomerDetailSheet";
import DealSheet from "../src/Modal and Sheets/DealSheet";
import PropertyDetailSheet from "../src/Modal and Sheets/PropertyDetailSheet";
import { SiteVisitSheet } from "../src/Modal and Sheets/SiteVisitSheet";
import SubscriptionSheet from "../src/Modal and Sheets/SubscriptionSheet";
import VisitFeedbackSheet from "../src/Modal and Sheets/VisitFeedbackSheet";

// Redux
import {
    addCustomer,
    clearSelectedCustomer,
    updateCustomer,
    updateCustomerStatus,
} from "../src/store/slices/customersSlice";

import {
    addDeal,
    clearSelectedDeal,
    closeDeal,
    setSelectedDeal,
    updateDeal,
} from "../src/store/slices/dealsSlice";

import {
    addFollowUp,
    clearActiveSiteVisit,
    clearShowFeedback,
    setShowFeedback,
    updateFollowUp
} from "../src/store/slices/followUpsSlice";

import {
    addProperty,
    clearSelectedProperty,
    updateProperty,
} from "../src/store/slices/propertiesSlice";

import { activateSubscription } from "../src/store/slices/subscriptionSlice";

import { useRouter } from "expo-router";
import {
    clearEditItem,
    setCollabOpen,
    setEditItem,
    setModalOpen,
    setModalType,
} from "../src/store/slices/uiSlice";

export default function Index() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Navigation handler
  const handleNavigation = (path) => {
    try {
      router.push(path);
    } catch (error) {
      console.warn('Navigation error:', error);
    }
  };

  // Redux state
  const { properties, selectedProperty } = useSelector((s) => s.properties);
  const { customers, selectedCustomer } = useSelector((s) => s.customers);
  const { followUps, activeSiteVisit, showFeedback } = useSelector(
    (s) => s.followUps,
  );
  const { deals, selectedDeal } = useSelector((s) => s.deals);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { showPaywall } = useSelector((s) => s.subscription);
  const { modalOpen, modalType, editItem, collabOpen } = useSelector(
    (s) => s.ui,
  );

  // Utils
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Modal handler for quick actions
  const handleOpenModal = (type) => {
    console.log('handleOpenModal called with type:', type);
    dispatch(clearEditItem());
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  // FAB
  const handleFABPress = () => {
    handleOpenModal("Property");
  };

  // Add
  const handleAdd = (data) => {
    const item = { ...data, id: generateId() };

    if (modalType === "Property") dispatch(addProperty(item));
    if (modalType === "Customer") dispatch(addCustomer(item));
    if (modalType === "FollowUp") dispatch(addFollowUp(item));

    dispatch(setModalOpen(false));
  };

  // Edit
  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = (item) => {
    console.log('handleUpdate called with:', { modalType, item });
    if (modalType === "Property") dispatch(updateProperty(item));
    if (modalType === "Customer") dispatch(updateCustomer(item));
    if (modalType === "FollowUp") dispatch(updateFollowUp(item));
    dispatch(clearEditItem());
    dispatch(setModalOpen(false));
  };

  // Deals
  const handleStartDeal = (customer, property) => {
    const deal = {
      id: generateId(),
      customerId: customer.id,
      propertyId: property.id,
      stage: "Meeting",
      startedAt: new Date().toISOString(),
      visits: [],
    };

    dispatch(addDeal(deal));
    dispatch(clearSelectedCustomer());
    dispatch(setSelectedDeal(deal));
  };

  const handleCloseDeal = (deal) => {
    dispatch(closeDeal(deal.id));

    const prop = properties.find((p) => p.id === deal.propertyId);
    if (prop) dispatch(updateProperty({ ...prop, status: "Sold" }));

    dispatch(
      updateCustomerStatus({
        id: deal.customerId,
        status: "Closed",
      }),
    );
  };

  // Site Visit
  const handleFinishVisit = (visit) => {
    dispatch(clearActiveSiteVisit());
    dispatch(setShowFeedback(visit));
  };

  const handleSubmitFeedback = (data) => {
    const deal = deals.find(
      (d) =>
        d.customerId === data.customer.id && d.propertyId === data.property.id,
    );

    if (deal) {
      dispatch(
        updateDeal({
          id: deal.id,
          deal: {
            ...deal,
            stage:
              data.feedback.sentiment === "interested"
                ? "Negotiation"
                : data.feedback.sentiment === "hold"
                  ? "Meeting"
                  : "Dropped",
            visits: [...(deal.visits || []), data.feedback],
          },
        }),
      );
    } else if (data.feedback.sentiment !== "not_interested") {
      handleStartDeal(data.customer, data.property);
    }

    dispatch(clearShowFeedback());
  };

  // Subscription
  const handleSubscribe = (plan) => {
    dispatch(activateSubscription({ plan }));
  };

  // FollowUp handlers
  const handleAddFollowUpFromCustomer = (customer) => {
    dispatch(setEditItem({ customerId: customer.id }));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  };

  const handleEditTask = (task) => {
    console.log('handleEditTask called with:', task);
    // Don't close customer detail sheet, just open modal on top
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="white" />

      {/* Dashboard */}
      <Dashboard
        properties={properties}
        customers={customers}
        followUps={followUps}
        activeDeals={deals}
        unreadCount={unreadCount}
        onOpenCollab={() => dispatch(setCollabOpen(true))}
        onOpenDeal={(deal) => dispatch(setSelectedDeal(deal))}
        onNavigate={handleNavigation}
        onOpenModal={handleOpenModal}
      />

      {/* FAB */}
      <FAB onPress={handleFABPress} />

      {/* Sheets */}
      <SubscriptionSheet
        isOpen={showPaywall}
        onSubscribe={handleSubscribe}
        onClose={() => {}}
      />

      <AddModal
        isOpen={modalOpen}
        type={modalType}
        editItem={editItem}
        properties={properties}
        customers={customers}
        initialCustomer={selectedCustomer}
        onSave={handleAdd}
        onUpdate={handleUpdate}
        onClose={() => dispatch(setModalOpen(false))}
      />

      {selectedProperty && (
        <PropertyDetailSheet
          property={selectedProperty}
          onEdit={handleEdit}
          onClose={() => dispatch(clearSelectedProperty())}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailSheet
          customer={selectedCustomer}
          properties={properties}
          activeDeals={deals}
          followUps={followUps}
          onClose={() => dispatch(clearSelectedCustomer())}
          onStartDeal={handleStartDeal}
          onAddFollowUp={handleAddFollowUpFromCustomer}
          onEditTask={handleEditTask}
        />
      )}

      {selectedDeal && (
        <DealSheet
          deal={selectedDeal}
          properties={properties}
          customers={customers}
          onClose={() => dispatch(clearSelectedDeal())}
          onUpdateDeal={(id, updated) =>
            dispatch(updateDeal({ id, deal: updated }))
          }
          onCloseDeal={(deal) => handleCloseDeal(deal)}
          onAddTask={(task) =>
            dispatch(addFollowUp({ ...task, id: generateId() }))
          }
        />
      )}

      <CollaborationSheet
        isOpen={collabOpen}
        onClose={() => dispatch(setCollabOpen(false))}
      />

      {activeSiteVisit && (
        <SiteVisitSheet
          activeVisit={activeSiteVisit}
          onFinish={handleFinishVisit}
          onClose={() => dispatch(clearActiveSiteVisit())}
        />
      )}

      {showFeedback && (
        <VisitFeedbackSheet
          visitData={showFeedback}
          onSubmit={handleSubmitFeedback}
          onClose={() => dispatch(clearShowFeedback())}
        />
      )}
    </View>
  );
}
