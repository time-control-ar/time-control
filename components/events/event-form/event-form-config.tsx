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
    handleAddCategory: (category: Category, modality: Modality) => void;
    handleAddGender: (gender: Gender) => void;
    handleRemoveGender: (index: number) => void;
    append: (modality: Modality) => void;
    newCategoryModality: Modality | null;
    setNewCategoryModality: (modality: Modality | null) => void;
}

export function EventFormConfig({
    watch,
    handleRemoveCategory,
    handleRemoveModality,
    handleAddCategory,
    handleAddGender,
    handleRemoveGender,
    append,
    newCategoryModality,
    setNewCategoryModality
}: EventFormConfigProps) {
    const modalities = watch('modalities')
    const genders = watch('genders')

    return (
        <div className="flex flex-col gap-6">
            <div className={`modern-table w-full ${genders?.length === 0 ? "hidden" : ""}`}>
                <div className="p-3 lg:p-6 border-b border-gray-200 dark:border-gray-900">
                    <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Géneros
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">
                    <table>
                        <thead className="modern-table-header !border-b border-gray-200 dark:border-gray-900">
                            <tr>
                                <th className="w-max max-w-max px-3 lg:!px-6">Nombre</th>
                                <th className="w-full">Valor en racecheck</th>
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

                <div className='p-6 border-t border-gray-200 dark:border-gray-900 flex flex-col gap-2'>
                    <div className="flex flex-col gap-1">
                        <p className="label-input">Crear género</p>
                        <GendersForm handleAddGender={handleAddGender} />
                    </div>
                </div>
            </div>

            <div className={`modern-table w-full ${modalities?.length === 0 ? "hidden" : ""}`}>
                <div className="p-3 lg:p-6 border-b border-gray-200 dark:border-gray-900">
                    <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                        Modalidades y categorías
                    </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">
                    <table>
                        <thead className="modern-table-header">
                            <tr>
                                <th className="w-max max-w-max px-3 lg:!px-6">Nombre</th>
                                <th className="w-full !border-x border-gray-200 dark:border-gray-900">Categorías</th>
                                <th className="w-max !text-center"> Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="modern-table-body">
                            {modalities?.map((modality: Modality, index: number) => {
                                return (
                                    <ModalityRow
                                        key={`${modality.name}-${index}`}
                                        modality={modality}
                                        index={index}
                                        handleRemoveCategory={handleRemoveCategory}
                                        handleRemoveModality={handleRemoveModality}
                                    />
                                )
                            }
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='p-4 border-t border-gray-200 dark:border-gray-900 flex flex-col md:flex-row gap-3 w-full'>
                    <div className="flex flex-col gap-1 w-full">
                        <p className="label-input">Crear modalidad</p>
                        <ModalityForm append={append} />
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <p className="label-input">Crear categoría</p>
                        {modalities && modalities.length > 0 && (
                            <CategoryForm
                                handleAddCategory={handleAddCategory}
                                modalities={modalities}
                                selectedModality={newCategoryModality}
                                setSelectedModality={setNewCategoryModality}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}