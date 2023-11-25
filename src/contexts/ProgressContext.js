


import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { progressEmitter } from '../components/upload/handleUplodadProgress';
import { useSubscribeToEventsQuery } from '../redux/features/socket/socketApi';


const ProgressContext = createContext()

const processReducer = (state, action) => {
    switch (action.type) {
        case "SET_PROCESS":
            const { fileName, name, ...rest } = action.payload || {};
            if (!fileName) return state;
            return {
                ...state,
                [fileName]: {
                    ...state[fileName],
                    [name]: { fileName, name, ...rest },
                },
            };
        case "RESET_PROCESS":
            return {};
        default:
            return state;
    }
};

export const ProgressProvider = ({ children }) => {
    useSubscribeToEventsQuery();
    const [process, dispatch] = useReducer(processReducer, {});
    const { process: dataProcess } = useSelector((state) => state.socket);
    const [uploadProgress, setUploadProgress] = useState(null);

    useEffect(() => {
        const handleProgress = (data) => {
            setUploadProgress(data);
        }

        progressEmitter.on('progress', handleProgress);

        return () => {
            progressEmitter.off('progress', handleProgress);
        }

    }, [])
    console.log(uploadProgress, 'uploadProgress');

    // Modify your useEffect to dispatch an action with a type and payload
    useEffect(() => {
        if (uploadProgress) {
            dispatch({ type: "SET_PROCESS", payload: uploadProgress });
        }
        if (dataProcess) {
            dispatch({ type: "SET_PROCESS", payload: dataProcess });
        }
    }, [dataProcess, uploadProgress]);

    return (
        <ProgressContext.Provider value={{ process, dispatch }}>
            {children}
        </ProgressContext.Provider>
    )
}


export const useProgress = () => useContext(ProgressContext);