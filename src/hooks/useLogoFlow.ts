import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { updateFormData, generateLogosAction } from '@/store/slices/logoSlice';
import { RootState, AppDispatch } from '@/store/store'; // Types ke liye

export const useLogoFlow = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // Redux state se data nikalna
  const { formData, status, results, error } = useSelector((state: RootState) => state.logo);

  // 1. Data Update karne ke liye (Step-by-Step Form)
  const handleUpdate = (data: Partial<typeof formData>) => {
    dispatch(updateFormData(data));
  };

  // 2. Logo Generation Start karne ke liye
  const startGeneration = async () => {
    // Pehle Loading/Generating page par bhejien (UX ke liye behtar hai)
    router.push('/generating'); 
    
    // API call trigger karein
    const resultAction = await dispatch(generateLogosAction(formData));
    
    // Agar API successful rahi to Results page par bhejien
    if (generateLogosAction.fulfilled.match(resultAction)) {
      router.push('/results');
    } else {
      console.error("Logo Generation Failed:", resultAction.payload || error);
      router.push('/create'); 
    }
  };

  return { 
    formData, 
    handleUpdate, 
    startGeneration, 
    isLoading: status === 'loading', 
    results,
    error 
  };
};
