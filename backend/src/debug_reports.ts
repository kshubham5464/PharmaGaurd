import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root (assuming script is in src/)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('URL:', process.env.SUPABASE_URL);

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testQuery() {
    // 1. Fetch Analyses only
    console.log('Fetching analyses without join...');
    const { data: analyses, error: analysisError } = await supabase
        .from('analyses')
        .select('*');

    if (analysisError) {
        console.error('Analysis Error:', analysisError);
        return;
    }
    console.log('Analyses Count:', analyses?.length);
    console.log('First Analysis:', analyses?.[0]);

    if (analyses && analyses.length > 0) {
        const patientId = analyses[0].patient_id;
        console.log('Checking Patient ID:', patientId);

        // 2. Fetch specific patient
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId);

        if (patientError) console.error('Patient Error:', patientError);
        console.log('Patient Data:', patient);

        // 3. Retry Join
        const { data: joinData, error: joinError } = await supabase
            .from('analyses')
            .select('*, patients(name)')
            .eq('id', analyses[0].id);

        if (joinError) console.error('Join Error:', joinError);
        console.log('Join Data:', JSON.stringify(joinData, null, 2));
    }
}

testQuery();
