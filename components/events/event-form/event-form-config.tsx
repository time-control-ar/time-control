import { UseFormWatch } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'
import { Category, Gender, Modality } from '@/lib/utils'
import { ModalityForm } from './modality-form'
import { CategoryForm } from './category-form'
import { ModalityRow } from './modality-row'
import { GendersForm } from './genders-form'
import { GenderRow } from './gender-row'

interface EventFormConfigProps {
    watch: UseFormWatch<EventFormData>;
    handleRemoveCategory: (categoryIndex: number, modalityIndex: number) => void;
    handleRemoveModality: (index: number) => void;
    handleEditCategory: (categoryIndex: number, modalityIndex: number) => void;
    handleAddCategory: (category: Category, modality: Modality) => void;
    handleAddGender: (gender: Gender) => void;
    handleRemoveGender: (index: number) => void;
    append: (modality: Modality) => void;
    newCategoryModality: Modality | null;
    setNewCategoryModality: (modality: Modality | null) => void;
    editingCategory?: {
        category: Category;
        categoryIndex: number;
        modalityIndex: number;
    } | null;
    handleCancelEdit?: () => void;
}

export function EventFormConfig({
    watch,
    handleRemoveCategory,
    handleRemoveModality,
    handleEditCategory,
    handleAddCategory,
    handleAddGender,
    handleRemoveGender,
    append,
    newCategoryModality,
    setNewCategoryModality,
    editingCategory,
    handleCancelEdit
}: EventFormConfigProps) {
    const modalities = watch('modalities')
    const genders = watch('genders')

    return (
        <div className="flex flex-col gap-12">
            <div className={`modern-table w-full custom_border flex flex-col rounded-xl  bg-white dark:bg-cblack ${modalities?.length === 0 ? "hidden" : ""}`}>
                <div className="p-3 lg:p-6 flex flex-col gap-6">
                    <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Modalidades | Categorías
                    </p>

                    <div className="grid grid-cols-1 gap-6 w-full">
                        <div className="flex flex-col gap-2">
                            <p className="label-input font-medium text-gray-700 dark:text-gray-300 font-mono">
                                Crear modalidad
                            </p>
                            <ModalityForm append={append} />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <p className="label-input font-medium text-gray-700 dark:text-gray-300 font-mono">
                                Crear categoría
                            </p>
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
                                    Primero crea una modalidad
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                        <thead className="modern-table-header">
                            <tr className="border-b">
                                <th className="w-1/4 px-3 lg:!px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                    Modalidad
                                </th>
                                <th className="w-2/3 px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                    Categorías
                                </th>
                                <th className="w-1/12 px-3 lg:!px-6 py-3 text-center font-medium text-gray-700 dark:text-gray-300">

                                </th>
                            </tr>
                        </thead>

                        <tbody className="modern-table-body">
                            {modalities?.map((modality: Modality, index: number) => (
                                <ModalityRow
                                    key={`${modality.name}-${index}`}
                                    modality={modality}
                                    index={index}
                                    handleRemoveCategory={handleRemoveCategory}
                                    handleRemoveModality={handleRemoveModality}
                                    handleEditCategory={handleEditCategory}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={`modern-table w-full ${genders?.length === 0 ? "hidden" : ""}`}>
                <div className="p-3 lg:p-6 border-b custom_border">
                    <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Géneros
                    </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">
                    <table>
                        <thead className="modern-table-header !border-b custom_border">
                            <tr>
                                <th className="w-max max-w-max px-3 lg:!px-6">Nombre</th>
                                <th className="w-max !text-center"></th>
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

                <div className='p-6 border-t custom_border flex flex-col gap-2'>
                    <div className="flex flex-col gap-1">
                        <p className="label-input">Crear género</p>
                        <GendersForm handleAddGender={handleAddGender} />
                    </div>
                </div>
            </div>


        </div>
    )
}