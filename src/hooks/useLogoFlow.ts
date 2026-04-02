import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { updateFormData, generateLogosAction } from '@/store/slices/logoSlice';
import { RootState, AppDispatch } from '@/store/store';

export const useLogoFlow = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { formData, status, results, error } = useSelector((state: RootState) => state.logo);

  const handleUpdate = (data: Partial<typeof formData>) => {
    dispatch(updateFormData(data));
  };

  const startGeneration = async () => {
    const generationPromise = dispatch(generateLogosAction(formData));
    router.push('/generating');

    const resultAction = await generationPromise;

    if (generateLogosAction.rejected.match(resultAction)) {
      console.error('Logo Generation Failed:', resultAction.payload || error);
    }
  };

  return {
    formData,
    handleUpdate,
    startGeneration,
    isLoading: status === 'loading',
    results,
    error,
  };
};
