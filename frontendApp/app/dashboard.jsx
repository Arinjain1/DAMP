import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useDispatch } from "react-redux";

// Views
import Dashboard from "../src/Views/Dashboard";

// Components & Sheets
import FAB from "../src/Components/FAB";
import AddModal from "../src/Modal and Sheets/AddModal";
import CollaborationSheet from "../src/Modal and Sheets/CollaborationSheet";
import CustomerDetailSheet from "../src/Modal and Sheets/CustomerDetailSheet";
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
  updateFollowUp,
} from "../src/store/slices/followUpsSlice";

import {
  addProperty,
  clearSelectedProperty,
  updateProperty,
} from "../src/store/slices/propertiesSlice";

import { activateSubscription } from "../src/store/slices/subscriptionSlice";

import { useAppSelector } from "@/src/redux/hooks";
import {
  clearEditItem,
  setCollabOpen,
  setEditItem,
  setModalOpen,
  setModalType,
} from "../src/store/slices/uiSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state - Optimized selectors
  const reduxState = useAppSelector((state) => ({
    properties: state.properties.properties,
    selectedProperty: state.properties.selectedProperty,
    customers: state.customers.customers,
    selectedCustomer: state.customers.selectedCustomer,
    followUps: state.followUps.followUps,
    activeSiteVisit: state.followUps.activeSiteVisit,
    showFeedback: state.followUps.showFeedback,
    deals: state.deals.deals,
    selectedDeal: state.deals.selectedDeal,
    unreadCount: state.notifications.unreadCount,
    showPaywall: state.subscription.showPaywall,
    modalOpen: state.ui.modalOpen,
    modalType: state.ui.modalType,
    editItem: state.ui.editItem,
    collabOpen: state.ui.collabOpen,
  }));

  const {
    properties,
    selectedProperty,
    customers,
    selectedCustomer,
    followUps,
    activeSiteVisit,
    showFeedback,
    deals,
    selectedDeal,
    unreadCount,
    showPaywall,
    modalOpen,
    modalType,
    editItem,
    collabOpen,
  } = reduxState;

  // Navigation handler
  const handleNavigation = (path) => {
    try {
      router.push(path);
    } catch (error) {
      console.warn("Navigation error:", error);
    }
  };

  // Utils
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Modal handler
  const handleOpenModal = (type) => {
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
      stage: "In-Process",
      startedAt: new Date().toISOString(),
      visits: [],
    };

    dispatch(addDeal(deal));
    dispatch(clearSelectedCustomer());
    dispatch(setSelectedDeal(deal));
    // Navigate to deal page
    router.push('/deal-page');
  };

  const handleCloseDeal = (deal) => {
    dispatch(closeDeal(deal.id));

    const prop = properties.find((p) => p.id === deal.propertyId);
    if (prop) dispatch(updateProperty({ ...prop, status: "Sold" }));

    dispatch(
      updateCustomerStatus({
        id: deal.customerId,
        status: "Closed",
      })
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
        d.customerId === data.customer.id &&
        d.propertyId === data.property.id
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
        })
      );
    }

    dispatch(clearShowFeedback());
  };

  // Subscription
  const handleSubscribe = (plan) => {
    dispatch(activateSubscription({ plan }));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="white" />

      <Dashboard
        properties={properties}
        customers={customers}
        followUps={followUps}
        activeDeals={deals}
        unreadCount={unreadCount}
        onOpenCollab={() => dispatch(setCollabOpen(true))}
        onOpenDeal={(deal) => {
          dispatch(setSelectedDeal(deal));
          router.push('/deal-page');
        }}
        onNavigate={handleNavigation}
        onOpenModal={handleOpenModal}
      />

      <FAB onPress={handleFABPress} />

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
