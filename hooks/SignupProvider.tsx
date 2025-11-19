import React, { createContext, useContext, useMemo, useState } from 'react';

export type ContactMethod = 'email' | 'phone';

type SignupContextValue = {
  contactMethod: ContactMethod | null;
  contactValue: string | null;
  firstName: string;
  lastName: string;
  setContact: (method: ContactMethod, value: string) => void;
  setName: (firstName: string, lastName: string) => void;
  reset: () => void;
};

const SignupContext = createContext<SignupContextValue | undefined>(undefined);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);
  const [contactValue, setContactValue] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const setContact = (method: ContactMethod, value: string) => {
    setContactMethod(method);
    setContactValue(value);
  };

  const setName = (first: string, last: string) => {
    setFirstName(first);
    setLastName(last);
  };

  const reset = () => {
    setContactMethod(null);
    setContactValue(null);
    setFirstName('');
    setLastName('');
  };

  const value = useMemo(
    () => ({
      contactMethod,
      contactValue,
      firstName,
      lastName,
      setContact,
      setName,
      reset,
    }),
    [contactMethod, contactValue, firstName, lastName]
  );

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) {
    throw new Error('useSignup must be used within SignupProvider');
  }
  return ctx;
}
