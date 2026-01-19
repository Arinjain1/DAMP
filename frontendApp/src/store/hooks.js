import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;