import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "../src/Views/Dashboard";
import FAB from "../src/Components/FAB";
import AddModal from "../src/Modal and Sheets/AddModal";
import CustomerDetailSheet from "../src/Modal and Sheets/CustomerDetailSheet";
import PropertyDetailSheet from "../src/Modal and Sheets/PropertyDetailSheet";
import SubscriptionSheet from "../src/Modal and Sheets/SubscriptionSheet";
import { propertiesAPI, customersAPI, dealsAPI, tasksAPI, visitsAPI } from "../src/config/api";
import { showToast } from "../src/utils/toast";
import { useInitializeData } from "../src/hooks/useInitializeData";
import {
  addCustomer,
  clearSelectedCustomer,
  updateCustomerLocal,
  updateCustomerStage,
} from "../src/store/slices/customersSlice";
import {
  addDeal,
  setSelectedDeal,
  fetchDeals,
} from "../src/store/slices/dealsSlice";
import {
  addFollowUp,
  setFollowUps,
  setLoading as setFollowUpsLoading,
} from "../src/store/slices/followUpsSlice";
import {
  addProperty,
  clearSelectedProperty,
  updateProperty,
  setProperties,
  setLoading,
  setError,
} from "../src/store/slices/propertiesSlice";
import { activateSubscription } from "../src/store/slices/subscriptionSlice";
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

  // Redux state - Individual selectors to avoid unnecessary rerenders
  const properties = useSelector((state) => state.properties.properties);
  const selectedProperty = useSelector((state) => state.properties.selectedProperty);
  const customers = useSelector((state) => state.customers.customers);
  const selectedCustomer = useSelector((state) => state.customers.selectedCustomer);
  const followUps = useSelector((state) => state.followUps.followUps);
  const deals = useSelector((state) => state.deals.deals);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const showPaywall = useSelector((state) => state.subscription.showPaywall);
  const modalOpen = useSelector((state) => state.ui.modalOpen);
  const modalType = useSelector((state) => state.ui.modalType);
  const editItem = useSelector((state) => state.ui.editItem);
  const collabOpen = useSelector((state) => state.ui.collabOpen);

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        dispatch(setLoading(true));
        const response = await propertiesAPI.getAll();

        if (response.data.success) {
          const mappedProperties = response.data.data.map(prop => ({
            id: prop.id,
            title: prop.title,
            listingType: prop.listing_type,
            category: prop.category || prop.property_category,
            type: prop.property_type,
            bhk: prop.configuration,
            furnishing: prop.furnishing_status,
            location: prop.locality || prop.city,
            city: prop.city,
            state: prop.state,
            price: prop.price,
            size: `${prop.size_sqft} ${prop.size_unit}`,
            image: prop.cover_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
            status: prop.status,
            owner: prop.owner_name,
            ownerPhone: prop.owner_phone,
            amenities: prop.amenities || [],
          }));

          dispatch(setProperties(mappedProperties));
        }
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to fetch properties'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchProperties();
  }, [dispatch]);

  // Initialize data hook (handles customers and deals)
  useInitializeData();

  // Fetch deals on component mount (backup in case hook doesn't run)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchDeals());
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch tasks function
  const fetchTasks = useCallback(async () => {
    try {
      dispatch(setFollowUpsLoading(true));
      const response = await tasksAPI.getAll();
      
      if (response.data.success) {
        const mappedTasks = response.data.data.map(task => ({
          id: task.id,
          customerId: task.client_id,
          customerName: task.client_name,
          propertyId: task.property_id,
          propertyIds: task.property_id ? [task.property_id] : [],
          type: task.task_type,
          date: `${task.due_date}T${task.due_time || '10:00'}`,
          note: task.description || task.notes || '',
          status: task.status,
          siteVisitId: task.site_visit_id,
        }));
        dispatch(setFollowUps(mappedTasks));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      dispatch(setFollowUpsLoading(false));
    }
  }, [dispatch]);

  // Navigation handler
  const handleNavigation = useCallback((path) => {
    router.push(path);
  }, [router]);

  // Utils
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Modal handler
  const handleOpenModal = useCallback((type) => {
    dispatch(clearEditItem());
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  }, [dispatch]);

  // FAB
  const handleFABPress = useCallback(() => {
    handleOpenModal("Property");
  }, [handleOpenModal]);

  // Add
  const handleAdd = async (data) => {
    try {
      if (modalType === "Property") {
        // Map form data to API structure
        const apiPayload = {
          listing_type: data.listingType || 'Sell',
          category: data.category || 'Residential', // Required NOT NULL field
          property_category: data.category || 'Residential', // Additional field
          property_type: data.type || '',
          configuration: data.bhk || data.commercialConfig || null,
          furnishing_status: data.furnishing || null,
          state: data.state || '',
          city: data.city || '',
          locality: data.location || '',
          project_name: data.title || '',
          address: data.owner || '',
          price: calculatePrice(data.priceValue, data.priceUnit),
          size: parseFloat(data.sizeValue) || 0,
          size_unit: data.sizeUnit || 'Sq. Ft.',
          length_ft: parseFloat(data.length) || 0,
          width_ft: parseFloat(data.width) || 0,
          owner_name: data.ownerName || '',
          owner_phone: data.ownerPhone || '',
          amenities: data.amenities || [],
          bond: data.bond ? parseFloat(data.bond) : null,
          image_url: data.image || null,
        };

        const response = await propertiesAPI.create(apiPayload);

        if (response.data.success) {
          dispatch(addProperty(response.data.data));
          dispatch(setModalOpen(false));
          showToast.success('Property created successfully!');
        }
      } else if (modalType === "Customer") {
        // Map customer form data to API structure
        const apiPayload = {
          name: data.name || '',
          phone: data.phone || '',
          requirement_type: data.listingType === 'Buy' ? 'Buy' : 'Rent',
          property_category: data.category || 'Residential',
          property_type: data.type || '',
          configuration: data.bhk || data.commercialConfig || null,
          furnishing_status: data.furnishing || null,
          budget_min: data.budgetMin || 0,
          budget_max: data.budgetMax || 0,
          preferred_location: data.preferredLocation || '',
          notes: data.details || '',
        };

        const response = await customersAPI.create(apiPayload);

        if (response.data.success) {
          // Map backend response to frontend format
          const mappedCustomer = {
            id: response.data.data.id,
            name: response.data.data.name,
            phone: response.data.data.phone,
            status: response.data.data.status,
            requirement: response.data.data.requirement_type,
            category: response.data.data.property_category,
            type: response.data.data.property_type,
            bhk: response.data.data.configuration,
            furnishing: response.data.data.furnishing_status,
            budgetMin: response.data.data.budget_min,
            budgetMax: response.data.data.budget_max,
            location: response.data.data.preferred_location,
            notes: response.data.data.notes,
          };

          dispatch(addCustomer(mappedCustomer));
          dispatch(setModalOpen(false));
          showToast.success('Customer added successfully!');
        }
      } else {
        // For FollowUp, keep the existing logic
        const item = { ...data, id: generateId() };
        if (modalType === "FollowUp") dispatch(addFollowUp(item));
        dispatch(setModalOpen(false));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create item. Please try again.';
      showToast.error(errorMessage);
    }
  };

  // Helper function to calculate price based on unit
  const calculatePrice = (value, unit) => {
    if (!value) return 0;
    const numValue = parseFloat(value);

    switch (unit) {
      case 'Thousands':
        return numValue * 1000;
      case 'Lakh':
        return numValue * 100000;
      case 'Crore':
        return numValue * 10000000;
      default:
        return numValue;
    }
  };

  // Edit
  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = async (data) => {
    try {
      if (modalType === "Property") {
        const apiPayload = {
          listing_type: data.listingType || 'Sell',
          category: data.category || 'Residential',
          property_category: data.category || 'Residential',
          property_type: data.type || '',
          configuration: data.bhk || data.commercialConfig || null,
          furnishing_status: data.furnishing || null,
          state: data.state || '',
          city: data.city || '',
          locality: data.location || '',
          project_name: data.title || '',
          address: data.owner || '',
          price: calculatePrice(data.priceValue, data.priceUnit),
          size: parseFloat(data.sizeValue) || 0,
          size_unit: data.sizeUnit || 'Sq. Ft.',
          length_ft: parseFloat(data.length) || 0,
          width_ft: parseFloat(data.width) || 0,
          owner_name: data.ownerName || '',
          owner_phone: data.ownerPhone || '',
          amenities: data.amenities || [],
          bond: data.bond ? parseFloat(data.bond) : null,
          image_url: data.image || null,
        };

        const response = await propertiesAPI.update(data.id, apiPayload);

        if (response.data.success) {
          dispatch(updateProperty(response.data.data));
          dispatch(clearEditItem());
          dispatch(setModalOpen(false));
          showToast.success('Property updated successfully!');
        }
      } else if (modalType === "FollowUp") {
        // Check if it's a Site Visit with multiple properties
        if ((data.type === 'Site Visit' || data.type === 'Visit') && data.propertyIds?.length > 1) {
          // For Site Visits with multiple properties, we need to delete and recreate
          // because backend doesn't support updating site visits yet
          showToast.error('To update properties in a Site Visit, please delete and create a new task');
          return;
        }

        // Update regular task in backend
        const updateData = {
          client_id: data.customerId,
          property_id: data.propertyIds?.[0] || null,
          task_type: data.type || data.task_type,
          schedule_date: data.date?.split('T')[0] || data.due_date?.split('T')[0],
          schedule_time: data.date?.split('T')[1]?.substring(0, 5) || data.due_date?.split('T')[1]?.substring(0, 5) || '10:00',
          notes: data.note || data.description || '',
          title: data.title
        };

        const response = await tasksAPI.update(data.id, updateData);

        if (response.data.success) {
          showToast.success('Task updated successfully!');
          await fetchTasks(); // Refresh tasks from backend
          dispatch(clearEditItem());
          dispatch(setModalOpen(false));
        }
      } else if (modalType === "Customer") {
        // Update customer in backend
        const apiPayload = {
          name: data.name || '',
          phone: data.phone || '',
          requirement_type: data.listingType === 'Buy' ? 'Buy' : 'Rent',
          property_category: data.category || 'Residential',
          property_type: data.type || '',
          configuration: data.bhk || data.commercialConfig || null,
          furnishing_status: data.furnishing || null,
          budget_min: data.budgetMin || 0,
          budget_max: data.budgetMax || 0,
          preferred_location: data.preferredLocation || '',
          notes: data.details || '',
        };

        const response = await customersAPI.update(data.id, apiPayload);

        if (response.data.success) {
          // Map backend response to frontend format
          const mappedCustomer = {
            id: response.data.data.id,
            name: response.data.data.name,
            phone: response.data.data.phone,
            status: response.data.data.status,
            stage: response.data.data.status,
            requirement: response.data.data.requirement_type,
            category: response.data.data.property_category,
            type: response.data.data.property_type,
            bhk: response.data.data.configuration,
            furnishing: response.data.data.furnishing_status,
            budgetMin: response.data.data.budget_min,
            budgetMax: response.data.data.budget_max,
            location: response.data.data.preferred_location,
            notes: response.data.data.notes,
          };

          dispatch(updateCustomerLocal(mappedCustomer));
          dispatch(clearEditItem());
          dispatch(setModalOpen(false));
          showToast.success('Customer updated successfully!');
        }
      } else {
        dispatch(clearEditItem());
        dispatch(setModalOpen(false));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update item. Please try again.';
      showToast.error(errorMessage);
    }
  };

  // Deals
  const handleStartDeal = async (customer, property) => {
    try {
      // Call backend API to create deal
      const response = await dealsAPI.create({
        client_id: customer.id,
        property_id: property.id
      });

      if (response.data.success) {
        showToast.success(response.data.message || 'Deal started successfully!');

        // Add deal to Redux
        const deal = {
          id: response.data.data.id,
          customerId: customer.id,
          propertyId: property.id,
          stage: response.data.data.status || 'Interested',
          startedAt: response.data.data.created_at,
          visits: [],
        };

        dispatch(addDeal(deal));
        dispatch(clearSelectedCustomer());
        dispatch(setSelectedDeal(deal));

        // Navigate to deal page
        router.push('/deal-page');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to start deal. Please try again.';
      showToast.error(errorMessage);
    }
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
        onOpenCollab={() => router.push('/collab-page')}
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
        onClose={() => { }}
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
          onClose={() => dispatch(clearSelectedCustomer())}
          onStartDeal={handleStartDeal}
          onAddFollowUp={async (taskData) => {
            try {
              // Check if it's a site visit with multiple properties
              if ((taskData.type === 'Site Visit' || taskData.type === 'Visit') && taskData.propertyIds?.length > 0) {
                // Create site visit (this will also create task in backend)
                const visitResponse = await visitsAPI.create({
                  client_id: taskData.customerId,
                  property_ids: taskData.propertyIds,
                  scheduled_date: taskData.date.split('T')[0],
                  scheduled_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00'
                });

                if (visitResponse.data.success) {
                  showToast.success('Site visit scheduled!');
                  await fetchTasks(); // Refresh tasks from backend
                }
              } else {
                // Create regular task
                const taskResponse = await tasksAPI.create({
                  client_id: taskData.customerId,
                  property_id: taskData.propertyIds?.[0] || null,
                  task_type: taskData.type || 'Meeting',
                  schedule_date: taskData.date.split('T')[0],
                  schedule_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00',
                  notes: taskData.note || ''
                });

                if (taskResponse.data.success) {
                  showToast.success('Task created!');
                  await fetchTasks(); // Refresh tasks from backend
                }
              }
            } catch (error) {
              console.error('Error creating task:', error);
              showToast.error(error.response?.data?.message || 'Failed to create task');
            }
          }}
          onEditTask={(task) => {
            dispatch(setEditItem(task));
            dispatch(setModalType('FollowUp'));
            dispatch(setModalOpen(true));
          }}
          onDeleteTask={async (taskId) => {
            try {
              const response = await tasksAPI.delete(taskId);
              if (response.data.success) {
                showToast.success('Task deleted');
                await fetchTasks(); // Refresh tasks from backend
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              showToast.error('Failed to delete task');
            }
          }}
          onUpdateStage={async (id, stage) => {
            try {
              const response = await customersAPI.updateStage(id, stage);
              if (response.data.success) {
                // Use the updateCustomerStage action to update Redux state
                dispatch(updateCustomerStage({ id, stage }));
                showToast.success(`Customer moved to ${stage} stage`);
              }
            } catch (error) {
              console.error('Failed to update stage:', error);
              showToast.error('Failed to update stage');
            }
          }}
        />
      )}

    </View>
  );
}
