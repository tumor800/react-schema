import * as React from 'react';
import {
  KeyedEntity,
  getEntityProps,
  getReactEntityComponent,
  createSchema
} from '@traveloka/react-schema';
import { Field } from './Field';
import { ValidationResult } from '../node_modules/@traveloka/validation';

type ValidationResultByName = {
  [name: string]: ValidationResult
};

interface Form {
  getValue: (name:string) => any,
  getValues: () => {[name: string]: any},
  setValue: (name:string, value: any) => any,
  setValues: (value: {[name: string]: any}) => any,
  getError: (name: string) => ValidationResult,
  getErrors: () => ValidationResultByName | null,
  setError: (name: string, error: ValidationResult) => ValidationResult,
  setErrors: (errors: ValidationResultByName) => ValidationResultByName,
  validate: () => ValidationResultByName | null,
  validateField: (name: string) => ValidationResult,
}

type FieldByName = {
  [name: string]: Field,
}

type FormProps = {
  onChangeField: (name: string, value: any) => void,
}

export function createForm(schemaEntity: KeyedEntity): React.ComponentClass<any> {
  const Component = class FormComponent extends React.Component<FormProps> implements Form {
    public fields: FieldByName = {};

    public render() {
      const formEntity: KeyedEntity = {};
      Object.entries(schemaEntity).map(([name, fieldComponent]) => {
        const FieldComponent = getReactEntityComponent(fieldComponent);
        const { defaultValue, rules, ...fieldProps } = getEntityProps(fieldComponent);
        formEntity[name] = {
          component: Field,
          onChange: (value:any) => this.props.onChangeField && this.props.onChangeField(name, value),
          rules,
          defaultValue,
          name,
          fieldProps,
          fieldComponent: FieldComponent
        }
      });
      const SchemaComponent = createSchema(formEntity);
      return (
        <SchemaComponent
          ref={(el: any) => {
            this.fields = el && el.entities;
          }}
        />
      )
    }

    public getValue = (name: string): any => {
      return this.fields[name].getValue();
    }

    public getValues = ():{[name: string]: any} => {
      return Object.keys(schemaEntity).reduce((values, name) => ({
        ...values,
        [name]: this.getValue(name),
      }), {})
    }

    public setValue = (name: string, value: any): any => {
      return this.fields[name].setValue(value);
    }

    public setValues = (values: {[name: string]: any}): any => {
      Object.entries(values).map(([name, value]) => this.setValue(name, value));
      return this.getValues();
    }

    public getError = (name: string): ValidationResult => {
      return this.fields[name].getError();
    }

    public getErrors = (): ValidationResultByName | null => {
      const errors = Object.keys(schemaEntity).reduce((values, name) => ({
        ...values,
        [name]: this.getError(name),
      }), {});
      if (Object.values(errors).filter(Boolean).length === 0) return null;
      return errors;
    }

    public setError = (name: string, error: ValidationResult): ValidationResult => {
      return this.fields[name].setError(error);
    }

    public setErrors = (errors:  ValidationResultByName): any => {
      Object.entries(errors).map(([name, error]) => this.setError(name, error));
      return this.getErrors();
    }

    public validateField = (name: string): ValidationResult => {
      return this.fields[name].validate();
    }

    public validate = (): ValidationResultByName | null => {
      const errors = Object.keys(schemaEntity).reduce((values, name) => ({
        ...values,
        [name]: this.validateField(name),
      }), {});
      if (Object.values(errors).filter(Boolean).length === 0) return null;
      return errors;
    }
  }
  return Component;
}
