import { CheckCircle, Eye, XCircle } from "lucide-react";

export default function PropertyModeration({ properties }) {
  return (
   <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-black text-gray-900">Property Moderation</h2>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 shadow-sm">Filter</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md">Review All</button>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
         {properties.map(prop => (
            <div key={prop.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4">
               <img src={prop.image} className="w-32 h-32 rounded-xl object-cover bg-gray-100" />
               <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                     <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending Review</span>
                     <span className="text-xs text-gray-400 font-bold">{prop.id}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{prop.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{prop.location} • {prop.price}</p>
                  <p className="text-xs text-gray-400 font-medium mb-4">By: {prop.broker}</p>
                  
                  <div className="flex gap-3">
                     <button className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold border border-green-200 hover:bg-green-100 flex items-center justify-center gap-1">
                        <CheckCircle size={14}/> Approve
                     </button>
                     <button className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-100 flex items-center justify-center gap-1">
                        <XCircle size={14}/> Reject
                     </button>
                     <button className="px-3 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100">
                        <Eye size={16}/>
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>
   </div>
   );
}
