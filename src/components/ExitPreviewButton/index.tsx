import { useRouter } from 'next/router';
import { previewDataProps } from '../../types/previewData';

import styles from './styles.module.scss';

export function ExitPreviewButton() {
    const router = useRouter();

    async function handleExitPreview() {
        try {
            const response = await fetch('/api/exit-preview');
            const { status, redirected, url} = response;

            if (status === 200 && redirected) {
                router.reload(url);
            } else {
                throw new Error('Error while trying to leave preview mode');
            }
        }  catch (err) {
            console.log(err);
        }
    }

    return (
        <button onClick={handleExitPreview} className={styles.exitPreviewButton}>
            Sair do modo Preview
        </button>
    )
}