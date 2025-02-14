import { getInitialStateMock } from '__mocks__/mocks';
import { select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import type { PayloadAction } from '@reduxjs/toolkit';

import { FormDataActions } from 'src/features/form/data/formDataSlice';
import {
  deleteAttachmentReferenceSaga,
  SelectAttachments,
  SelectCurrentView,
  SelectFormData,
  SelectLayouts,
} from 'src/features/form/data/update/updateFormDataSagas';
import type { IDeleteAttachmentReference } from 'src/features/form/data/formDataTypes';
import type {
  IAttachment,
  IAttachments,
} from 'src/shared/resources/attachments';
import type { IDataModelBindings, IRuntimeState } from 'src/types';

describe('updateFormDataSagas', () => {
  const testDeleteAttachmentReferenceSaga =
    (
      formDataBefore: any,
      formDataAfter: any,
      attachmentState: IAttachments,
      componentId: string,
      dataBinding: IDataModelBindings,
    ) =>
    () => {
      const state: IRuntimeState = getInitialStateMock();
      state.formData.formData = {
        SomethingElse: 'value',
        ...formDataBefore,
      };
      state.attachments.attachments = attachmentState;

      const expectedUpdatedFormData = {
        SomethingElse: 'value',
        ...formDataAfter,
      };

      const action: PayloadAction<IDeleteAttachmentReference> = {
        type: FormDataActions.deleteAttachmentReference.type,
        payload: {
          attachmentId: 'abc123',
          componentId: componentId,
          dataModelBindings: dataBinding,
        },
      };

      return expectSaga(deleteAttachmentReferenceSaga, action)
        .provide([
          [select(SelectFormData), SelectFormData(state)],
          [select(SelectLayouts), SelectLayouts(state)],
          [select(SelectAttachments), SelectAttachments(state)],
          [select(SelectCurrentView), SelectCurrentView(state)],
        ])
        .put(
          FormDataActions.setFulfilled({
            formData: expectedUpdatedFormData,
          }),
        )
        .put(FormDataActions.save())
        .run();
    };

  const makeAttachment = (id: string): IAttachment => ({
    id,
    uploaded: true,
    deleting: false,
    size: 1234,
    tags: [],
    updating: false,
    name: 'someFile.pdf',
  });

  it(
    'deleteAttachmentReferenceSaga works for simple components',
    testDeleteAttachmentReferenceSaga(
      { MyAttachment: 'abc123' },
      {},
      { component1: [makeAttachment('abc123')] },
      'component1',
      { simpleBinding: 'MyAttachment' },
    ),
  );

  it(
    'deleteAttachmentReferenceSaga works for list binding',
    testDeleteAttachmentReferenceSaga(
      { 'MyAttachment[0]': 'abc123', 'MyAttachment[1]': 'def456' },
      { 'MyAttachment[0]': 'def456' },
      { component1: [makeAttachment('abc123'), makeAttachment('def456')] },
      'component1',
      { list: 'MyAttachment' },
    ),
  );

  it(
    'deleteAttachmentReferenceSaga works for list binding in repeating group',
    testDeleteAttachmentReferenceSaga(
      {
        'Group[0].MyAttachment[0]': 'abc123',
        'Group[0].MyAttachment[1]': 'def456',
      },
      { 'Group[0].MyAttachment[0]': 'def456' },
      { 'component1-0': [makeAttachment('abc123'), makeAttachment('def456')] },
      'component1-0',
      { list: 'Group[0].MyAttachment' },
    ),
  );
});
