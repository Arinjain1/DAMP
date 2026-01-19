import {
    Bell,
    Briefcase,
    Clock,
    Handshake,
    Plus,
    UserPlus,
    Users,
    Zap,
} from 'lucide-react-native';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const Dashboard = ({
  properties = [],
  customers = [],
  followUps = [],
  activeDeals = [],
  unreadCount = 0,
  onOpenCollab,
  onOpenDeal,
  onNavigate, // Add navigation prop
}) => {

  const stats = {
    active: properties.filter(p => p.status === 'Available').length,
    leads: customers.length,
    tasks: followUps.filter(f => f.status === 'Pending').length,
    hotLeads: activeDeals.length,
  };

  const NavItem = ({ icon: Icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} className="items-center gap-[2vw] flex-1">
      <View className="h-[14vw] w-[14vw] rounded-2xl items-center justify-center bg-gray-50 border border-gray-100 active:bg-gray-100">
        <Icon size={24} color="#374151" strokeWidth={2} />
      </View>
      <Text className="text-[2.8vw] font-bold text-gray-500 text-center">
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatBox = ({ label, count, icon: Icon, color, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white p-[3vw] rounded-2xl border border-gray-100 flex-col items-center justify-center h-[28vw] w-[42vw]"
    >
      <View className={`w-[10vw] h-[10vw] rounded-full items-center justify-center ${color} mb-[2vw]`}>
        <Icon size={18} color="white" />
      </View>
      <Text className="text-[5vw] font-black text-gray-900">{count}</Text>
      <Text className="text-[2.5vw] font-bold text-gray-400 uppercase mt-[1vw]">
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-white pt-[10vw] px-[6vw] pb-[4vw] border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-[3vw] font-bold uppercase">
            BrokerOne
          </Text>
          <Text className="text-[6vw] font-black text-gray-900">
            Overview
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onNavigate && onNavigate('/notifications')}
          className="p-[2vw]"
        >
          <Bell size={24} color="#374151" />
          {unreadCount > 0 && (
            <View className="absolute top-[2vw] right-[2vw] h-[2.5vw] w-[2.5vw] bg-rose-500 rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* STATS */}
        <View className="px-[5vw] mt-[6vw] flex-row flex-wrap justify-between gap-[3vw]">
          <StatBox
            label="Properties"
            count={stats.active}
            icon={Briefcase}
            color="bg-blue-600"
            onPress={() => onNavigate && onNavigate('/properties')}
          />
          <StatBox
            label="Clients"
            count={stats.leads}
            icon={Users}
            color="bg-emerald-600"
            onPress={() => onNavigate && onNavigate('/customers')}
          />
          <StatBox
            label="Tasks"
            count={stats.tasks}
            icon={Clock}
            color="bg-amber-500"
            onPress={() => onNavigate && onNavigate('/followups')}
          />
          <StatBox
            label="Deals"
            count={stats.hotLeads}
            icon={Zap}
            color="bg-rose-500"
            onPress={() => onNavigate && onNavigate('/deals')}
          />
        </View>

        {/* QUICK ACTIONS */}
        <View className="px-[5vw] mt-[8vw]">
          <Text className="text-[3vw] font-bold text-gray-400 uppercase mb-[4vw]">
            Quick Actions
          </Text>
          <View className="flex-row gap-[3vw]">
            <NavItem
              icon={UserPlus}
              label="New Lead"
              onPress={() => onNavigate && onNavigate('/customers/add')}
            />
            <NavItem
              icon={Plus}
              label="Add Prop"
              onPress={() => onNavigate && onNavigate('/properties/add')}
            />
            <NavItem
              icon={Briefcase}
              label="Deals"
              onPress={() => onNavigate && onNavigate('/deals')}
            />
            <NavItem
              icon={Handshake}
              label="Collab"
              onPress={onOpenCollab}
            />
          </View>
        </View>

        {/* ACTIVE DEALS */}
        {activeDeals.length > 0 && (
          <View className="mt-[8vw]">
            <View className="px-[5vw] flex-row items-center justify-between mb-[4vw]">
              <View className="flex-row items-center gap-[2vw]">
                <Briefcase size={20} color="#4f46e5" />
                <Text className="text-[4.5vw] font-bold text-gray-900">Active Deals</Text>
              </View>
              <View className="bg-indigo-50 px-[2vw] py-[1vw] rounded-md">
                <Text className="text-indigo-700 text-[3vw] font-bold">{activeDeals.length}</Text>
              </View>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            >
              {activeDeals.map(deal => {
                const property = properties.find(p => p.id === deal.propertyId);
                const customer = customers.find(c => c.id === deal.customerId);
                return (
                  <TouchableOpacity
                    key={deal.id}
                    onPress={() => onOpenDeal(deal)}
                    activeOpacity={0.9}
                    className="w-[70vw] bg-white p-[4vw] rounded-2xl shadow-sm border border-gray-100 flex-col"
                  >
                    <View className="flex-row justify-between items-start mb-[3vw]">
                      <View className="flex-row gap-[3vw] flex-1">
                        <Image 
                          source={{ uri: property?.image }} 
                          className="h-[10vw] w-[10vw] rounded-xl bg-gray-100" 
                        />
                        <View className="flex-1 mr-[2vw]">
                          <Text className="text-[3.5vw] font-bold text-gray-900" numberOfLines={1}>
                            {property?.title}
                          </Text>
                          <Text className="text-[3vw] text-gray-500" numberOfLines={1}>
                            {customer?.name}
                          </Text>
                        </View>
                      </View>
                      <View className="bg-indigo-50 px-[2vw] py-[1vw] rounded">
                        <Text className="text-indigo-700 text-[2.5vw] font-bold">{deal.stage}</Text>
                      </View>
                    </View>
                    
                    <View className="mt-auto pt-[3vw] border-t border-gray-50 flex-row justify-between items-center">
                      <Text className="text-[3vw] font-bold text-gray-400">Next: Meeting</Text>
                      <Text className="text-[3.5vw] font-black text-gray-900">{formatCurrency(property?.price)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* TODAY'S FOCUS (TASKS) */}
        <View className="px-[5vw] mt-[8vw]">
          <View className="flex-row items-center justify-between mb-[4vw]">
            <Text className="text-[4.5vw] font-bold text-gray-900">Today's Focus</Text>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('/followups')}>
              <Text className="text-[3.5vw] font-bold text-blue-600">View All</Text>
            </TouchableOpacity>
          </View>
          
          {followUps.filter(f => f.status === 'Pending').slice(0, 2).map((task) => {
            const customer = customers.find(c => c.id === task.customerId);
            const taskDate = new Date(task.date);
            return (
              <View key={task.id} className="bg-white p-[4vw] rounded-2xl border border-gray-100 shadow-sm flex-row items-start gap-[4vw] mb-[3vw]">
                <View className="bg-blue-50 w-[12vw] h-[12vw] rounded-xl flex-col items-center justify-center">
                  <Text className="text-[2.5vw] font-bold text-blue-400 uppercase">
                    {taskDate.toLocaleString('default', { month: 'short' })}
                  </Text>
                  <Text className="text-[5vw] font-black text-blue-900 leading-none">
                    {taskDate.getDate()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[3.5vw] text-gray-900">{customer?.name}</Text>
                  <Text className="text-[3vw] text-gray-500 mt-[0.5vw]" numberOfLines={1}>{task.note}</Text>
                  <View className="self-start bg-gray-50 px-[2vw] py-[0.5vw] rounded mt-[2vw]">
                    <Text className="text-[2.5vw] font-bold text-gray-400">
                      {taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Dashboard;
