export class StringUtils {
	static hasText(text: string | null | undefined) {
		if (!text || text.trim().length === 0) {
			return false
		}
        return true;
	}
}
