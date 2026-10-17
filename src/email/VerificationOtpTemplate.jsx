import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';
import * as React from 'react';

export const VerificationOtpTemplate = ({ otp, name }) => {
    return (
        <Html>
            <Head />
            <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f5', padding: '20px' }}>
                <Container style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px' }}>
                    <Heading style={{ color: '#18181b' }}>Hi {name || 'Developer'},</Heading>
                    <Text style={{ color: '#4a4a4a', fontSize: '16px' }}>
                        Thank you for registering on DevFlow. Use the 6-digit OTP provided to verify your email
                    </Text>
                    <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                        <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px', color: '#2563eb' }}>
                            {otp}
                        </span>
                    </Section>
                    <Text style={{ color: '#71717a', fontSize: '14px' }}>
                        This request is valid for the next 24 hours. If you did not request this, please ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};