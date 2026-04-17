import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ContactModel = runtime.Types.Result.DefaultSelection<Prisma.$ContactPayload>;
export type AggregateContact = {
    _count: ContactCountAggregateOutputType | null;
    _min: ContactMinAggregateOutputType | null;
    _max: ContactMaxAggregateOutputType | null;
};
export type ContactMinAggregateOutputType = {
    id: string | null;
    phoneNumber: string | null;
    name: string | null;
    organizationId: string | null;
    createdAt: Date | null;
};
export type ContactMaxAggregateOutputType = {
    id: string | null;
    phoneNumber: string | null;
    name: string | null;
    organizationId: string | null;
    createdAt: Date | null;
};
export type ContactCountAggregateOutputType = {
    id: number;
    phoneNumber: number;
    name: number;
    organizationId: number;
    createdAt: number;
    _all: number;
};
export type ContactMinAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    name?: true;
    organizationId?: true;
    createdAt?: true;
};
export type ContactMaxAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    name?: true;
    organizationId?: true;
    createdAt?: true;
};
export type ContactCountAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    name?: true;
    organizationId?: true;
    createdAt?: true;
    _all?: true;
};
export type ContactAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ContactWhereInput;
    orderBy?: Prisma.ContactOrderByWithRelationInput | Prisma.ContactOrderByWithRelationInput[];
    cursor?: Prisma.ContactWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ContactCountAggregateInputType;
    _min?: ContactMinAggregateInputType;
    _max?: ContactMaxAggregateInputType;
};
export type GetContactAggregateType<T extends ContactAggregateArgs> = {
    [P in keyof T & keyof AggregateContact]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateContact[P]> : Prisma.GetScalarType<T[P], AggregateContact[P]>;
};
export type ContactGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ContactWhereInput;
    orderBy?: Prisma.ContactOrderByWithAggregationInput | Prisma.ContactOrderByWithAggregationInput[];
    by: Prisma.ContactScalarFieldEnum[] | Prisma.ContactScalarFieldEnum;
    having?: Prisma.ContactScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ContactCountAggregateInputType | true;
    _min?: ContactMinAggregateInputType;
    _max?: ContactMaxAggregateInputType;
};
export type ContactGroupByOutputType = {
    id: string;
    phoneNumber: string;
    name: string | null;
    organizationId: string;
    createdAt: Date;
    _count: ContactCountAggregateOutputType | null;
    _min: ContactMinAggregateOutputType | null;
    _max: ContactMaxAggregateOutputType | null;
};
export type GetContactGroupByPayload<T extends ContactGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ContactGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ContactGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ContactGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ContactGroupByOutputType[P]>;
}>>;
export type ContactWhereInput = {
    AND?: Prisma.ContactWhereInput | Prisma.ContactWhereInput[];
    OR?: Prisma.ContactWhereInput[];
    NOT?: Prisma.ContactWhereInput | Prisma.ContactWhereInput[];
    id?: Prisma.StringFilter<"Contact"> | string;
    phoneNumber?: Prisma.StringFilter<"Contact"> | string;
    name?: Prisma.StringNullableFilter<"Contact"> | string | null;
    organizationId?: Prisma.StringFilter<"Contact"> | string;
    createdAt?: Prisma.DateTimeFilter<"Contact"> | Date | string;
    Organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    messages?: Prisma.MessageListRelationFilter;
};
export type ContactOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    phoneNumber?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    Organization?: Prisma.OrganizationOrderByWithRelationInput;
    messages?: Prisma.MessageOrderByRelationAggregateInput;
};
export type ContactWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    organizationId_phoneNumber?: Prisma.ContactOrganizationIdPhoneNumberCompoundUniqueInput;
    AND?: Prisma.ContactWhereInput | Prisma.ContactWhereInput[];
    OR?: Prisma.ContactWhereInput[];
    NOT?: Prisma.ContactWhereInput | Prisma.ContactWhereInput[];
    phoneNumber?: Prisma.StringFilter<"Contact"> | string;
    name?: Prisma.StringNullableFilter<"Contact"> | string | null;
    organizationId?: Prisma.StringFilter<"Contact"> | string;
    createdAt?: Prisma.DateTimeFilter<"Contact"> | Date | string;
    Organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    messages?: Prisma.MessageListRelationFilter;
}, "id" | "organizationId_phoneNumber">;
export type ContactOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    phoneNumber?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ContactCountOrderByAggregateInput;
    _max?: Prisma.ContactMaxOrderByAggregateInput;
    _min?: Prisma.ContactMinOrderByAggregateInput;
};
export type ContactScalarWhereWithAggregatesInput = {
    AND?: Prisma.ContactScalarWhereWithAggregatesInput | Prisma.ContactScalarWhereWithAggregatesInput[];
    OR?: Prisma.ContactScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ContactScalarWhereWithAggregatesInput | Prisma.ContactScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Contact"> | string;
    phoneNumber?: Prisma.StringWithAggregatesFilter<"Contact"> | string;
    name?: Prisma.StringNullableWithAggregatesFilter<"Contact"> | string | null;
    organizationId?: Prisma.StringWithAggregatesFilter<"Contact"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Contact"> | Date | string;
};
export type ContactCreateInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    createdAt?: Date | string;
    Organization: Prisma.OrganizationCreateNestedOneWithoutContactInput;
    messages?: Prisma.MessageCreateNestedManyWithoutContactInput;
};
export type ContactUncheckedCreateInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    organizationId: string;
    createdAt?: Date | string;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutContactInput;
};
export type ContactUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    Organization?: Prisma.OrganizationUpdateOneRequiredWithoutContactNestedInput;
    messages?: Prisma.MessageUpdateManyWithoutContactNestedInput;
};
export type ContactUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutContactNestedInput;
};
export type ContactCreateManyInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    organizationId: string;
    createdAt?: Date | string;
};
export type ContactUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ContactUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ContactOrganizationIdPhoneNumberCompoundUniqueInput = {
    organizationId: string;
    phoneNumber: string;
};
export type ContactCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    phoneNumber?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ContactMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    phoneNumber?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ContactMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    phoneNumber?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ContactScalarRelationFilter = {
    is?: Prisma.ContactWhereInput;
    isNot?: Prisma.ContactWhereInput;
};
export type ContactListRelationFilter = {
    every?: Prisma.ContactWhereInput;
    some?: Prisma.ContactWhereInput;
    none?: Prisma.ContactWhereInput;
};
export type ContactOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type ContactCreateNestedOneWithoutMessagesInput = {
    create?: Prisma.XOR<Prisma.ContactCreateWithoutMessagesInput, Prisma.ContactUncheckedCreateWithoutMessagesInput>;
    connectOrCreate?: Prisma.ContactCreateOrConnectWithoutMessagesInput;
    connect?: Prisma.ContactWhereUniqueInput;
};
export type ContactUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: Prisma.XOR<Prisma.ContactCreateWithoutMessagesInput, Prisma.ContactUncheckedCreateWithoutMessagesInput>;
    connectOrCreate?: Prisma.ContactCreateOrConnectWithoutMessagesInput;
    upsert?: Prisma.ContactUpsertWithoutMessagesInput;
    connect?: Prisma.ContactWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ContactUpdateToOneWithWhereWithoutMessagesInput, Prisma.ContactUpdateWithoutMessagesInput>, Prisma.ContactUncheckedUpdateWithoutMessagesInput>;
};
export type ContactCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.ContactCreateWithoutOrganizationInput, Prisma.ContactUncheckedCreateWithoutOrganizationInput> | Prisma.ContactCreateWithoutOrganizationInput[] | Prisma.ContactUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ContactCreateOrConnectWithoutOrganizationInput | Prisma.ContactCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.ContactCreateManyOrganizationInputEnvelope;
    connect?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
};
export type ContactUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.ContactCreateWithoutOrganizationInput, Prisma.ContactUncheckedCreateWithoutOrganizationInput> | Prisma.ContactCreateWithoutOrganizationInput[] | Prisma.ContactUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ContactCreateOrConnectWithoutOrganizationInput | Prisma.ContactCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.ContactCreateManyOrganizationInputEnvelope;
    connect?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
};
export type ContactUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.ContactCreateWithoutOrganizationInput, Prisma.ContactUncheckedCreateWithoutOrganizationInput> | Prisma.ContactCreateWithoutOrganizationInput[] | Prisma.ContactUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ContactCreateOrConnectWithoutOrganizationInput | Prisma.ContactCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.ContactUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.ContactUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.ContactCreateManyOrganizationInputEnvelope;
    set?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    disconnect?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    delete?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    connect?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    update?: Prisma.ContactUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.ContactUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.ContactUpdateManyWithWhereWithoutOrganizationInput | Prisma.ContactUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.ContactScalarWhereInput | Prisma.ContactScalarWhereInput[];
};
export type ContactUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.ContactCreateWithoutOrganizationInput, Prisma.ContactUncheckedCreateWithoutOrganizationInput> | Prisma.ContactCreateWithoutOrganizationInput[] | Prisma.ContactUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.ContactCreateOrConnectWithoutOrganizationInput | Prisma.ContactCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.ContactUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.ContactUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.ContactCreateManyOrganizationInputEnvelope;
    set?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    disconnect?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    delete?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    connect?: Prisma.ContactWhereUniqueInput | Prisma.ContactWhereUniqueInput[];
    update?: Prisma.ContactUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.ContactUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.ContactUpdateManyWithWhereWithoutOrganizationInput | Prisma.ContactUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.ContactScalarWhereInput | Prisma.ContactScalarWhereInput[];
};
export type ContactCreateWithoutMessagesInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    createdAt?: Date | string;
    Organization: Prisma.OrganizationCreateNestedOneWithoutContactInput;
};
export type ContactUncheckedCreateWithoutMessagesInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    organizationId: string;
    createdAt?: Date | string;
};
export type ContactCreateOrConnectWithoutMessagesInput = {
    where: Prisma.ContactWhereUniqueInput;
    create: Prisma.XOR<Prisma.ContactCreateWithoutMessagesInput, Prisma.ContactUncheckedCreateWithoutMessagesInput>;
};
export type ContactUpsertWithoutMessagesInput = {
    update: Prisma.XOR<Prisma.ContactUpdateWithoutMessagesInput, Prisma.ContactUncheckedUpdateWithoutMessagesInput>;
    create: Prisma.XOR<Prisma.ContactCreateWithoutMessagesInput, Prisma.ContactUncheckedCreateWithoutMessagesInput>;
    where?: Prisma.ContactWhereInput;
};
export type ContactUpdateToOneWithWhereWithoutMessagesInput = {
    where?: Prisma.ContactWhereInput;
    data: Prisma.XOR<Prisma.ContactUpdateWithoutMessagesInput, Prisma.ContactUncheckedUpdateWithoutMessagesInput>;
};
export type ContactUpdateWithoutMessagesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    Organization?: Prisma.OrganizationUpdateOneRequiredWithoutContactNestedInput;
};
export type ContactUncheckedUpdateWithoutMessagesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ContactCreateWithoutOrganizationInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    createdAt?: Date | string;
    messages?: Prisma.MessageCreateNestedManyWithoutContactInput;
};
export type ContactUncheckedCreateWithoutOrganizationInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    createdAt?: Date | string;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutContactInput;
};
export type ContactCreateOrConnectWithoutOrganizationInput = {
    where: Prisma.ContactWhereUniqueInput;
    create: Prisma.XOR<Prisma.ContactCreateWithoutOrganizationInput, Prisma.ContactUncheckedCreateWithoutOrganizationInput>;
};
export type ContactCreateManyOrganizationInputEnvelope = {
    data: Prisma.ContactCreateManyOrganizationInput | Prisma.ContactCreateManyOrganizationInput[];
    skipDuplicates?: boolean;
};
export type ContactUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.ContactWhereUniqueInput;
    update: Prisma.XOR<Prisma.ContactUpdateWithoutOrganizationInput, Prisma.ContactUncheckedUpdateWithoutOrganizationInput>;
    create: Prisma.XOR<Prisma.ContactCreateWithoutOrganizationInput, Prisma.ContactUncheckedCreateWithoutOrganizationInput>;
};
export type ContactUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.ContactWhereUniqueInput;
    data: Prisma.XOR<Prisma.ContactUpdateWithoutOrganizationInput, Prisma.ContactUncheckedUpdateWithoutOrganizationInput>;
};
export type ContactUpdateManyWithWhereWithoutOrganizationInput = {
    where: Prisma.ContactScalarWhereInput;
    data: Prisma.XOR<Prisma.ContactUpdateManyMutationInput, Prisma.ContactUncheckedUpdateManyWithoutOrganizationInput>;
};
export type ContactScalarWhereInput = {
    AND?: Prisma.ContactScalarWhereInput | Prisma.ContactScalarWhereInput[];
    OR?: Prisma.ContactScalarWhereInput[];
    NOT?: Prisma.ContactScalarWhereInput | Prisma.ContactScalarWhereInput[];
    id?: Prisma.StringFilter<"Contact"> | string;
    phoneNumber?: Prisma.StringFilter<"Contact"> | string;
    name?: Prisma.StringNullableFilter<"Contact"> | string | null;
    organizationId?: Prisma.StringFilter<"Contact"> | string;
    createdAt?: Prisma.DateTimeFilter<"Contact"> | Date | string;
};
export type ContactCreateManyOrganizationInput = {
    id?: string;
    phoneNumber: string;
    name?: string | null;
    createdAt?: Date | string;
};
export type ContactUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    messages?: Prisma.MessageUpdateManyWithoutContactNestedInput;
};
export type ContactUncheckedUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutContactNestedInput;
};
export type ContactUncheckedUpdateManyWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phoneNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ContactCountOutputType = {
    messages: number;
};
export type ContactCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    messages?: boolean | ContactCountOutputTypeCountMessagesArgs;
};
export type ContactCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactCountOutputTypeSelect<ExtArgs> | null;
};
export type ContactCountOutputTypeCountMessagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MessageWhereInput;
};
export type ContactSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    phoneNumber?: boolean;
    name?: boolean;
    organizationId?: boolean;
    createdAt?: boolean;
    Organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    messages?: boolean | Prisma.Contact$messagesArgs<ExtArgs>;
    _count?: boolean | Prisma.ContactCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["contact"]>;
export type ContactSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    phoneNumber?: boolean;
    name?: boolean;
    organizationId?: boolean;
    createdAt?: boolean;
    Organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["contact"]>;
export type ContactSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    phoneNumber?: boolean;
    name?: boolean;
    organizationId?: boolean;
    createdAt?: boolean;
    Organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["contact"]>;
export type ContactSelectScalar = {
    id?: boolean;
    phoneNumber?: boolean;
    name?: boolean;
    organizationId?: boolean;
    createdAt?: boolean;
};
export type ContactOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "phoneNumber" | "name" | "organizationId" | "createdAt", ExtArgs["result"]["contact"]>;
export type ContactInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    Organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    messages?: boolean | Prisma.Contact$messagesArgs<ExtArgs>;
    _count?: boolean | Prisma.ContactCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ContactIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    Organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
};
export type ContactIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    Organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
};
export type $ContactPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Contact";
    objects: {
        Organization: Prisma.$OrganizationPayload<ExtArgs>;
        messages: Prisma.$MessagePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        phoneNumber: string;
        name: string | null;
        organizationId: string;
        createdAt: Date;
    }, ExtArgs["result"]["contact"]>;
    composites: {};
};
export type ContactGetPayload<S extends boolean | null | undefined | ContactDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ContactPayload, S>;
export type ContactCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ContactFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ContactCountAggregateInputType | true;
};
export interface ContactDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Contact'];
        meta: {
            name: 'Contact';
        };
    };
    findUnique<T extends ContactFindUniqueArgs>(args: Prisma.SelectSubset<T, ContactFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ContactFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ContactFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ContactFindFirstArgs>(args?: Prisma.SelectSubset<T, ContactFindFirstArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ContactFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ContactFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ContactFindManyArgs>(args?: Prisma.SelectSubset<T, ContactFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ContactCreateArgs>(args: Prisma.SelectSubset<T, ContactCreateArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ContactCreateManyArgs>(args?: Prisma.SelectSubset<T, ContactCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ContactCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ContactCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ContactDeleteArgs>(args: Prisma.SelectSubset<T, ContactDeleteArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ContactUpdateArgs>(args: Prisma.SelectSubset<T, ContactUpdateArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ContactDeleteManyArgs>(args?: Prisma.SelectSubset<T, ContactDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ContactUpdateManyArgs>(args: Prisma.SelectSubset<T, ContactUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ContactUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ContactUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ContactUpsertArgs>(args: Prisma.SelectSubset<T, ContactUpsertArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ContactCountArgs>(args?: Prisma.Subset<T, ContactCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ContactCountAggregateOutputType> : number>;
    aggregate<T extends ContactAggregateArgs>(args: Prisma.Subset<T, ContactAggregateArgs>): Prisma.PrismaPromise<GetContactAggregateType<T>>;
    groupBy<T extends ContactGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ContactGroupByArgs['orderBy'];
    } : {
        orderBy?: ContactGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ContactGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ContactFieldRefs;
}
export interface Prisma__ContactClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    Organization<T extends Prisma.OrganizationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganizationDefaultArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    messages<T extends Prisma.Contact$messagesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Contact$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ContactFieldRefs {
    readonly id: Prisma.FieldRef<"Contact", 'String'>;
    readonly phoneNumber: Prisma.FieldRef<"Contact", 'String'>;
    readonly name: Prisma.FieldRef<"Contact", 'String'>;
    readonly organizationId: Prisma.FieldRef<"Contact", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Contact", 'DateTime'>;
}
export type ContactFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where: Prisma.ContactWhereUniqueInput;
};
export type ContactFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where: Prisma.ContactWhereUniqueInput;
};
export type ContactFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where?: Prisma.ContactWhereInput;
    orderBy?: Prisma.ContactOrderByWithRelationInput | Prisma.ContactOrderByWithRelationInput[];
    cursor?: Prisma.ContactWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ContactScalarFieldEnum | Prisma.ContactScalarFieldEnum[];
};
export type ContactFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where?: Prisma.ContactWhereInput;
    orderBy?: Prisma.ContactOrderByWithRelationInput | Prisma.ContactOrderByWithRelationInput[];
    cursor?: Prisma.ContactWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ContactScalarFieldEnum | Prisma.ContactScalarFieldEnum[];
};
export type ContactFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where?: Prisma.ContactWhereInput;
    orderBy?: Prisma.ContactOrderByWithRelationInput | Prisma.ContactOrderByWithRelationInput[];
    cursor?: Prisma.ContactWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ContactScalarFieldEnum | Prisma.ContactScalarFieldEnum[];
};
export type ContactCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ContactCreateInput, Prisma.ContactUncheckedCreateInput>;
};
export type ContactCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ContactCreateManyInput | Prisma.ContactCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ContactCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    data: Prisma.ContactCreateManyInput | Prisma.ContactCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ContactIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ContactUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ContactUpdateInput, Prisma.ContactUncheckedUpdateInput>;
    where: Prisma.ContactWhereUniqueInput;
};
export type ContactUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ContactUpdateManyMutationInput, Prisma.ContactUncheckedUpdateManyInput>;
    where?: Prisma.ContactWhereInput;
    limit?: number;
};
export type ContactUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ContactUpdateManyMutationInput, Prisma.ContactUncheckedUpdateManyInput>;
    where?: Prisma.ContactWhereInput;
    limit?: number;
    include?: Prisma.ContactIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ContactUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where: Prisma.ContactWhereUniqueInput;
    create: Prisma.XOR<Prisma.ContactCreateInput, Prisma.ContactUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ContactUpdateInput, Prisma.ContactUncheckedUpdateInput>;
};
export type ContactDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where: Prisma.ContactWhereUniqueInput;
};
export type ContactDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ContactWhereInput;
    limit?: number;
};
export type Contact$messagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MessageSelect<ExtArgs> | null;
    omit?: Prisma.MessageOmit<ExtArgs> | null;
    include?: Prisma.MessageInclude<ExtArgs> | null;
    where?: Prisma.MessageWhereInput;
    orderBy?: Prisma.MessageOrderByWithRelationInput | Prisma.MessageOrderByWithRelationInput[];
    cursor?: Prisma.MessageWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MessageScalarFieldEnum | Prisma.MessageScalarFieldEnum[];
};
export type ContactDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ContactSelect<ExtArgs> | null;
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    include?: Prisma.ContactInclude<ExtArgs> | null;
};
