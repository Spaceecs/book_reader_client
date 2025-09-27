import {Alert, Text, TouchableOpacity, View} from "react-native";

export function ReadMoreBookCard({item}) {
    return (
        <View style={styles.card}>
            <Image source={{ uri: item.cover }} style={styles.cover} defaultSource={require('../../../../assets/placeholder-cover.png')} />
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>{item.author}</Text>
                <Text style={styles.pageInfo}>Сторінка {item.currentPage} з {item.totalPages}</Text>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{item.progress}%</Text>
                </View>
                <TouchableOpacity style={styles.continueButton} onPress={() => Alert.alert('Читання', `Відкрити книгу: ${item.title}`)}>
                    <Text style={styles.continueButtonText}>Продовжити читання</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center',
    },
    cover: {
        width: 60,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 2,
    },
    author: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    pageInfo: {
        fontSize: 13,
        color: '#8C8C8C',
        marginBottom: 2,
    },
    progressBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginRight: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2E8B57',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#2E8B57',
        fontWeight: '600',
        minWidth: 32,
        textAlign: 'right',
    },
    continueButton: {

    },
    continueButtonText: {
        color: '#2E8B57',
        fontSize: 14,
        fontWeight: '600',
    },
})