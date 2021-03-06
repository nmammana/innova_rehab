import React, { useContext, useState } from 'react'
import ExerciseCard from './ExerciseCard'
import Loading from '../../components/Loading/Loading';

import firebase from "firebase/app";
import 'firebase/firestore';

import './ExercisesList.scss'
import {    Select,
            Table,
            Tbody,
            Input, 
} from "@chakra-ui/react"
import { ExercisesContext } from '../../contexts/ExercisesContext';
import ExerciseAddModal from './ExerciseAddModal';
import { CategoriesContext } from '../../contexts/CategoriesContext';


export default function ExerciseList() {
    const[categoryFilter, setCategoryFilter] = useState('');
    const[searchFilter, setSearchFilter] = useState('');
    const db = firebase.firestore();
    const {categories} = useContext(CategoriesContext);
    const { 
        exercises, 
        setExercises,
        isLoadingExercises, 
        setIsLoadingExercises
    } = useContext(ExercisesContext);
    
    const deleteExercise = async (exerciseDeleted) =>{
        setIsLoadingExercises(true);
        try{
            await db.collection('exercises').doc(exerciseDeleted.id).delete()
        }catch(error){
            console.error(error);
        }
        const nonDeletedExercises = exercises.filter(exercise => exercise.id !== exerciseDeleted.id)
        setExercises(nonDeletedExercises);
        setIsLoadingExercises(false);
    }
    
    return (
        <section className="exercises-list">  
            {categories &&
                    <div className="toolbar">
                        <div className="toolbar__primary">
                            <Select placeholder="Elija una categoría" className="form-input form-font select-bar" 
                                    name="category"  onChange={(e)=>setCategoryFilter(e.target.value)}
                                    disabled={categories?.length === 0}>
                                {categories && categories.map((category) => (   
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="toolbar__secondary">
                            <Input  type= "text" className= "form-input form-font search-bar" name = "name" 
                                    placeholder="Busque un ejercicio..." onChange={(e)=>setSearchFilter(e.target.value)} value={searchFilter}></Input>
                        
                            <ExerciseAddModal/>
                        </div>
                    </div>
            }
            
            {exercises && 
                <Table variant="simple">
                    {/* <Thead>
                        <Tr>
                            <Th>Nombre</Th>
                            <Th>Categoría</Th>
                            <Th>Video</Th>
                        </Tr>
                    </Thead> */}
                    <Tbody>
                            {exercises.filter((exercise) => {
                                if(searchFilter==="" && categoryFilter ===""){
                                    return exercise;
                                }else if(searchFilter==="" && exercise.category.toLowerCase().includes(categoryFilter.toLowerCase())){
                                    return exercise;
                                }else if(exercise.name.toLowerCase().includes(searchFilter.toLowerCase()) && categoryFilter===""){
                                    return exercise;
                                }else if(exercise.name.toLowerCase().includes(searchFilter.toLowerCase()) && exercise.category.toLowerCase().includes(categoryFilter.toLowerCase())){
                                    return exercise;
                                }else{
                                    return false;
                                }
                            }).map((exercise)=>(
                                <ExerciseCard
                                    exercise={exercise}
                                    key={exercise.id}
                                    deleteExercise={deleteExercise}
                                />
                            ))}
                    </Tbody>
                </Table>
            }
            {isLoadingExercises && <Loading/>}
            {!isLoadingExercises && exercises?.length===0 &&
                <p className="message body1">Aún no hay ejercicios registrados...</p>
            }
            {exercises?.length===0 && categoryFilter && 
                <p className="message body1">Aún no hay ejercicios en esta categoría</p>
            }  
        </section>
    )
}
