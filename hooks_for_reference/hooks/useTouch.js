import { useState } from 'react';
import { useNavContext, useViewModeContext } from '../utils/NavigationContext';
import { useHardReload } from './useHardReload.js';

// swipe to close/open cards 

const useTouch = () => {
    const MAX_PULL = 45;
    const [startY, setStartY] = useState(0);
    const [pullY, setPullY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { navRef,tokenview,setTokenview,setCardView} = useViewModeContext()
    const {ix,setIx, setCardIx,prevIx} = useNavContext()
    const hardReload = useHardReload();

    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
       };
    
    const handleTouchMove = (e) => {
        if (!isDragging || !e.touches?.length) return;
        const delta = e.touches[0].clientY - startY;
        if (delta <= 0) {
            if (pullY !== 0) setPullY(0);
            return;
        }
        setPullY(Math.min(MAX_PULL, Math.round(delta)));
    };
     
    const handleTouchEnd = (e) => {
        const endY = e.changedTouches[0].clientY;
        if (pullY >= MAX_PULL) {
            hardReload();
            setPullY(0);
            setIsDragging(false);
            return;
        }
        if (endY - startY > 25 && !tokenview) { // remove touch on views (funds/assets), that would make scroll very hard
            setIsCollapsed(true)
            setIx(null)
            setTokenview(false)
            setPullY(0);
            setIsDragging(false);
            return
        }        
        if (startY - endY > 50) {
            setIsCollapsed(false)
        }
        setPullY(0);
        setIsDragging(false);
    };

    const handleToggleView = (index) => {
        // GENERAL call to reset cardview to default on back
        if (index.ix !== 2){
            setCardView('default')
        }
        if (index.i === 3){
            // shortcut to certificates
            setIx(index.ix)
            navRef.current.assetTab = false
        }
        if(ix === index.ix){
            setIx(null)
            setCardIx(null)
            setTokenview(false) // test
            prevIx.current = null
        } else {
            console.log('[CARDVIEW]', index)
            setIx(index.ix)
            setCardIx(index.hasOwnProperty('i') && index.i)
            if (index <= 3){
                prevIx.current = index
            }
        }
    }

    const handleCollapse = (ix) => {
        if (ix === 5){
            setIx(null)
            setIsCollapsed(true)
            setTokenview(false)
            return;
        } 
        console.log('handleCollapse', ix)
        setIx(null)
        setIsCollapsed(!isCollapsed)
        setTokenview(tokenview ? !tokenview : tokenview)
    };
   
    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleToggleView,
        handleCollapse,
        isCollapsed,
        pullY,
        isDragging,
    };
  };

export default useTouch
