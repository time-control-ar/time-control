import { UseFormWatch } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'
import { Category, Gender, Modality } from '@/lib/schemas/event.schema'
import { ModalityForm } from './modality-form'
import { CategoryForm } from './category-form'
import { ModalityRow } from './modality-row'
import { CategoryRow } from './category-row'
import { GendersForm } from './genders-form'
import { GenderRow } from './gender-row'
import { useEffect } from 'react'
import { RacecheckCategoryForm } from './racecheck-category-form'

interface EventFormConfigProps {
    watch: UseFormWatch<EventFormData>;
    handleRemoveCategory: (categoryIndex: number, modalityIndex: number) => void;
    handleRemoveModality: (index: number) => void;
    handleEditCategory: (categoryIndex: number, modalityIndex: number) => void;
    handleAddCategory: (category: Category, modality: Modality) => void;
    append: (modality: Modality) => void;
    newCategoryModality: Modality | null;
    setNewCategoryModality: (modality: Modality | null) => void;
    editingCategory?: {
        category: Category;
        categoryIndex: number;
        modalityIndex: number;
    } | null;
    handleCancelEdit?: () => void;
    racecheckUnassignedCategories: string[];
    handleAddGender: (gender: Gender) => void;
    handleRemoveGender: (index: number) => void;
}

export function EventFormConfig({
    watch,
    handleRemoveCategory,
    handleRemoveModality,
    handleEditCategory,
    handleAddCategory,
    append,
    newCategoryModality,
    setNewCategoryModality,
    editingCategory,
    handleCancelEdit,
    racecheckUnassignedCategories,
    handleAddGender,
    handleRemoveGender,
}: EventFormConfigProps) {
    const modalities = watch('modalities') ?? []
    const genders = watch('genders') ?? []

    // Auto-seleccionar la modalidad más reciente cuando se agrega una nueva
    useEffect(() => {
        if (modalities.length > 0 && !newCategoryModality) {
            const latestModality = modalities[modalities.length - 1];
            setNewCategoryModality(latestModality);
        }
    }, [modalities.length, newCategoryModality, setNewCategoryModality]);

    // Filtrar categorías de Racecheck que no existen en ninguna modalidad
    // const getUnassignedRacecheckCategories = () => {
    //     if (!modalities || modalities.length === 0) {
    //         return racecheckUnassignedCategories
    //     }

    //     // Obtener todas las categorías existentes en las modalidades
    //     const existingCategories = modalities.flatMap(modality =>
    //         modality.categories?.map(cat => cat?.matchsWith ?? '') ?? []
    //     )

    //     // Filtrar solo las categorías que no existen
    //     return racecheckUnassignedCategories.filter(category =>
    //         !existingCategories.includes(category)
    //     )
    // }

    const unassignedCategories = racecheckUnassignedCategories ?? []

    // Obtener todas las categorías para la tabla de categorías
    const allCategories = modalities?.flatMap((modality, modalityIndex) =>
        modality.categories?.map((category, categoryIndex) => ({
            category,
            modality,
            categoryIndex,
            modalityIndex
        })) ?? []
    ) ?? []

    return (
        <div className="flex flex-col gap-12 w-full md:w-[700px] mx-auto">
            {/* Tabla de Modalidades */}
            <div className="flex flex-col gap-3 w-full">
                <div className="px-3 lg:px-6">
                    <p className='text-xl font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Modalidades
                    </p>
                </div>

                <div className={`modern-table w-full custom_border flex flex-col rounded-xl`}>
                    <div className="grid grid-cols-1 gap-6 w-full p-3 lg:p-6 border-b border-gray-200 dark:border-cgray">
                        <ModalityForm append={append} />
                    </div>
                    <div className="w-full max-h-[90vh] md:max-h-[300px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="modern-table-header">
                                <tr>
                                    <th className="!px-5 py-3 !max-w-max text-left font-medium text-gray-700 dark:text-gray-300">
                                        Nombre
                                    </th>
                                    <th className="!px-5 py-3 !max-w-max text-left font-medium text-gray-700 dark:text-gray-300">
                                        Categorías
                                    </th>
                                    <th className="!w-1/12 !text-center !px-3 lg:!px-6"></th>
                                </tr>
                            </thead>

                            <tbody className="modern-table-body">
                                {modalities && modalities.length > 0 && modalities?.map((modality: Modality, index: number) => (
                                    <ModalityRow
                                        key={`${modality.name}-${index}`}
                                        modality={modality}
                                        index={index}
                                        handleRemoveModality={handleRemoveModality}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tabla de Categorías */}
            <div className='flex flex-col gap-3'>
                <div className="px-3 lg:px-6">
                    <p className='text-xl font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Categorías
                    </p>
                </div>
                {unassignedCategories.length > 0 && modalities && modalities.length > 0 && (
                    <div className="flex flex-col gap-1 w-full mt-3">
                        <div className="flex flex-col gap-2 h-min max-h-[280px] overflow-auto relative border-4 border-red-100 dark:border-red-500 rounded-xl">
                            <div className="sticky top-0 bg-white dark:bg-cblack z-20">
                                <div className="absolute top-0 left-0 w-full h-max bg-red-100 dark:bg-red-500 z-10 max-w-max rounded-br-xl">
                                    <p className="text-sm font-medium font-mono tracking-tight text-red-500 dark:text-red-100 text-center max-w-max z-20 p-2">
                                        {unassignedCategories.length} categorías no asignadas
                                    </p>
                                </div>
                            </div>

                            <div className='w-full h-max flex flex-col justify-center items-center gap-2 pt-12 pb-6 rounded-2xl divide-y divide-gray-200 dark:divide-cblack'>
                                {unassignedCategories?.map((category: string, index: number) => (
                                    <div key={index} className='px-6 py-3 flex justify-center items-center w-full'>
                                        <RacecheckCategoryForm
                                            key={`${index} - ${category}`}
                                            category={category}
                                            modalities={modalities ?? []}
                                            onAddCategory={handleAddCategory}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className={`modern-table w-full custom_border flex flex-col rounded-xl`}>
                    <div className="grid grid-cols-1 gap-6 w-full p-3 lg:p-6 border-b border-gray-200 dark:border-cgray">
                        {modalities && modalities.length > 0 ? (
                            <CategoryForm
                                handleAddCategory={handleAddCategory}
                                modalities={modalities}
                                selectedModality={newCategoryModality}
                                setSelectedModality={setNewCategoryModality}
                                editingCategory={editingCategory}
                                onCancelEdit={handleCancelEdit}
                            />
                        ) : (
                            <div className="text-sm text-gray-400 dark:text-gray-500 py-2">
                                Crea una modalidad para empezar a agregar categorías
                            </div>
                        )}
                    </div>
                    <div className="w-full max-h-[60vh] overflow-y-auto">
                        <table className="w-full">
                            <thead className="modern-table-header">
                                <tr>
                                    <th className="!px-5 py-3 !max-w-max text-left font-medium text-gray-700 dark:text-gray-300">
                                        Nombre
                                    </th>
                                    <th className="w-1/2 px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                        Modalidad
                                    </th>
                                    <th className="!px-3 lg:!px-6 !max-w-max !text-center">
                                        <span></span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="modern-table-body">
                                {allCategories.length > 0 ? (
                                    allCategories.map(({ category, modality, categoryIndex, modalityIndex }) => (
                                        <CategoryRow
                                            key={`${category.name}-${categoryIndex}-${modalityIndex}`}
                                            category={category}
                                            modality={modality}
                                            categoryIndex={categoryIndex}
                                            modalityIndex={modalityIndex}
                                            handleRemoveCategory={handleRemoveCategory}
                                            handleEditCategory={handleEditCategory}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tabla de Géneros */}
            <div className='flex flex-col gap-3 w-full'>
                <div className="px-3 lg:px-6">
                    <p className='text-xl font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Géneros
                    </p>
                </div>

                <div className={`modern-table w-full custom_border flex flex-col rounded-xl`}>
                    <div className='grid grid-cols-1 gap-6 w-full p-3 lg:p-6 border-b border-gray-200 dark:border-cgray'>
                        <GendersForm handleAddGender={handleAddGender} />
                    </div>

                    <div className="w-full max-h-[90vh] md:max-h-[300px] overflow-y-auto">
                        <table>
                            <thead className="modern-table-header">
                                <tr>
                                    <th className="w-max max-w-max px-3 lg:!px-6">Nombre</th>
                                    <th className="!w-1/12 !text-center !px-3 lg:!px-6"></th>
                                </tr>
                            </thead>

                            <tbody className="modern-table-body">
                                {genders?.map((gender: Gender, index: number) => {
                                    return (
                                        <GenderRow
                                            key={`${gender.name}-${index}`}
                                            gender={gender}
                                            index={index}
                                            handleRemoveGender={handleRemoveGender}
                                        />
                                    )
                                }
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


        </div>
    )
}