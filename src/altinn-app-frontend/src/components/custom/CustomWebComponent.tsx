import React from 'react';

import { useAppSelector } from 'src/common/hooks';
import type { IComponentProps } from 'src/components';
import type { ILayoutCompCustom } from 'src/features/form/layout';
import type { ITextResource, ITextResourceBindings } from 'src/types';

import { getTextResourceByKey } from 'altinn-shared/utils';

export type ICustomComponentProps = IComponentProps &
  Omit<ILayoutCompCustom, 'type'> & {
    [key: string]: string | number | boolean | object;
  };

function CustomWebComponent({
  tagName,
  formData,
  componentValidations,
  textResourceBindings,
  dataModelBindings,
  language,
  handleDataChange,
  ...passThroughProps
}: ICustomComponentProps) {
  const Tag = tagName;
  const wcRef = React.useRef(null);
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );

  React.useLayoutEffect(() => {
    const { current } = wcRef;
    if (current) {
      const handleChange = (customEvent: CustomEvent) => {
        const { value, field } = customEvent.detail;
        handleDataChange(value, field);
      };

      current.addEventListener('dataChanged', handleChange);
      return () => {
        current.removeEventListener('dataChanged', handleChange);
      };
    }
  }, [handleDataChange, wcRef]);

  React.useLayoutEffect(() => {
    const { current } = wcRef;
    if (current) {
      current.texts = getTextsForComponent(
        textResourceBindings,
        textResources,
        false,
      );
      current.dataModelBindings = dataModelBindings;
      current.language = language;
    }
  }, [wcRef, textResourceBindings, textResources, dataModelBindings, language]);

  React.useLayoutEffect(() => {
    const { current } = wcRef;
    if (current) {
      current.formData = formData;
      current.componentValidations = componentValidations;
    }
  }, [formData, componentValidations]);

  if (!Tag || !textResources) {
    return null;
  }

  const propsAsAttributes: any = {};
  Object.keys(passThroughProps).forEach((key) => {
    let prop = passThroughProps[key];
    if (['object', 'array'].includes(typeof prop)) {
      prop = JSON.stringify(passThroughProps[key]);
    }
    propsAsAttributes[key] = prop;
  });

  return (
    <div>
      <Tag
        ref={wcRef}
        data-testid={tagName}
        {...propsAsAttributes}
      />
    </div>
  );
}

function getTextsForComponent(
  textResourceBindings: ITextResourceBindings,
  textResources: ITextResource[],
  stringify = true,
) {
  const result: any = {};
  Object.keys(textResourceBindings).forEach((key) => {
    result[key] = getTextResourceByKey(
      textResourceBindings[key],
      textResources,
    );
  });

  if (stringify) {
    return JSON.stringify(result);
  }
  return result;
}

export default CustomWebComponent;
