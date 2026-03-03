import {
   HelpCircle,
   ThumbsDown,
   ThumbsUp,
   X
} from 'lucide-react-native';
import { useState } from 'react';
import {
   Modal,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from 'react-native';
import { showToast } from '../utils/toast';


const VisitFeedbackSheet = ({ visitData, onClose, onSubmit }) => {
   const [feedback, setFeedback] = useState('');
   const [sentiment, setSentiment] = useState(null); // 'interested', 'not_interested', 'hold'
   const [tags, setTags] = useState([]);

   const handleTag = (tag) => {
      if (tags.includes(tag)) setTags(tags.filter(t => t !== tag));
      else setTags([...tags, tag]);
   };

   const handleSubmit = () => {
      if (!sentiment) return showToast.error("Please select a status (Interested/Not/Hold)");
      onSubmit({
         ...visitData,
         feedback: {
            sentiment,
            note: feedback,
            tags,
            date: new Date().toISOString()
         }
      });
   };

   return (
      <Modal
         visible={true}
         transparent={true}
         animationType="slide"
         onRequestClose={onClose}
         statusBarTranslucent
      >
         <View className="flex-1 justify-end bg-black/80">

            <View className="bg-white w-full h-[85vh] rounded-t-[10vw] flex-col overflow-hidden shadow-2xl">

               {/* Header */}
               <View className="p-[6vw] border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
                  <View>
                     <Text className="text-[5vw] font-black text-gray-900">Visit Feedback</Text>
                     <Text className="text-[3vw] text-gray-500 font-bold">Record buyer&apos;s reaction</Text>
                  </View>
                  <TouchableOpacity onPress={onClose} className="p-[2vw]">
                     <X size={20} color="#000" />
                  </TouchableOpacity>
               </View>

               <ScrollView className="flex-1 p-[6vw]" contentContainerStyle={{ paddingBottom: 100 }}>

                  {/* 1. Sentiment Selection */}
                  <View className="mb-[6vw]">
                     <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[3vw]">Overall Reaction</Text>
                     <View className="flex-row justify-between gap-[3vw]">

                        <TouchableOpacity
                           onPress={() => setSentiment('interested')}
                           className={`flex-1 p-[4vw] rounded-2xl border-2 items-center gap-[2vw] ${sentiment === 'interested' ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'}`}
                        >
                           <ThumbsUp size={28} color={sentiment === 'interested' ? '#15803d' : '#9ca3af'} fill={sentiment === 'interested' ? '#15803d' : 'transparent'} />
                           <Text className={`text-[2.5vw] font-bold ${sentiment === 'interested' ? 'text-green-700' : 'text-gray-400'}`}>Interested</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                           onPress={() => setSentiment('hold')}
                           className={`flex-1 p-[4vw] rounded-2xl border-2 items-center gap-[2vw] ${sentiment === 'hold' ? 'border-amber-500 bg-amber-50' : 'border-gray-100 bg-white'}`}
                        >
                           <HelpCircle size={28} color={sentiment === 'hold' ? '#b45309' : '#9ca3af'} fill={sentiment === 'hold' ? '#b45309' : 'transparent'} />
                           <Text className={`text-[2.5vw] font-bold ${sentiment === 'hold' ? 'text-amber-700' : 'text-gray-400'}`}>Suspense</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                           onPress={() => setSentiment('not_interested')}
                           className={`flex-1 p-[4vw] rounded-2xl border-2 items-center gap-[2vw] ${sentiment === 'not_interested' ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white'}`}
                        >
                           <ThumbsDown size={28} color={sentiment === 'not_interested' ? '#b91c1c' : '#9ca3af'} fill={sentiment === 'not_interested' ? '#b91c1c' : 'transparent'} />
                           <Text className={`text-[2.5vw] font-bold ${sentiment === 'not_interested' ? 'text-red-700' : 'text-gray-400'}`}>Not Interested</Text>
                        </TouchableOpacity>

                     </View>
                  </View>

                  {/* 2. Analysis / Notes */}
                  <View className="mb-[6vw]">
                     <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[3vw]">Property Analysis & Notes</Text>
                     <TextInput
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={feedback}
                        onChangeText={setFeedback}
                        placeholder="What did the buyer like? Any concerns about price, location, or vastu?"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-[4vw] text-[3vw] font-medium min-h-[120px]"
                     />
                  </View>

                  {/* 3. Tags based on sentiment */}
                  {sentiment && (
                     <View>
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[3vw]">Key Factors</Text>
                        <View className="flex-row flex-wrap gap-[2vw]">
                           {(sentiment === 'interested' ? ['Good Price', 'Great Location', 'Liked Layout', 'Vastu Compliant'] :
                              sentiment === 'not_interested' ? ['Price High', 'Bad Location', 'Small Rooms', 'No Vastu'] :
                                 ['Need Time', 'Comparing Others', 'Family Decision']).map(tag => (
                                    <TouchableOpacity
                                       key={tag}
                                       onPress={() => handleTag(tag)}
                                       className={`px-[4vw] py-[2vw] rounded-xl border ${tags.includes(tag) ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                                    >
                                       <Text className={`text-[2.5vw] font-bold ${tags.includes(tag) ? 'text-white' : 'text-gray-500'}`}>{tag}</Text>
                                    </TouchableOpacity>
                                 ))}
                        </View>
                     </View>
                  )}

               </ScrollView>

               <View className="p-[5vw] border-t border-gray-100 bg-white">
                  <TouchableOpacity
                     onPress={handleSubmit}
                     className="w-full bg-gray-900 py-[3vw] rounded-2xl shadow-xl active:scale-95 items-center"
                  >
                     <Text className="text-white font-bold text-[4vw]">Save Feedback & Update Deal</Text>
                  </TouchableOpacity>
               </View>

            </View>
         </View>
      </Modal>
   );
};
export default VisitFeedbackSheet;