import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// We don't use the global 'supabase' from config anymore for this action
// import { supabase } from '../config/supabase';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        // Create a scoped client for this request using the user's JWT
        const supabaseClient = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_ANON_KEY || '',
            {
                global: {
                    headers: {
                        Authorization: authHeader,
                    },
                },
            }
        );

        // In a real app, filtering by doctor_id from verified JWT
        const { data, error } = await supabaseClient
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const { name, age, gender, medical_history, condition, prescribed_drug, doctor_id } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        // Create a scoped client for this request using the user's JWT
        const supabaseClient = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_ANON_KEY || '', // Use Anon key here, JWT upgrades permissions
            {
                global: {
                    headers: {
                        Authorization: authHeader,
                    },
                },
            }
        );

        // Validation (Basic)
        if (!name || !doctor_id) {
            return res.status(400).json({ error: "Name and Doctor ID are required" });
        }

        const { data, error } = await supabaseClient
            .from('patients')
            .insert([{
                name,
                age,
                gender,
                medical_history,
                condition,
                prescribed_drug,
                doctor_id
            }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error: any) {
        console.error("Error creating patient:", error);
        res.status(500).json({ error: error.message });
    }
};
