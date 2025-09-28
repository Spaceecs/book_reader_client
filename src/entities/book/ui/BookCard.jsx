import {Text, TouchableOpacity, View, Image, StyleSheet, Dimensions} from "react-native";
import { openOnlineBook } from "../utils/openOnlineBook";
import {useDispatch} from "react-redux";
import {useNavigation} from "@react-navigation/native";

export function BookCard({ book, setSelectedItem, setIsActionsVisible }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const handleLongPress = () => {
        if (setSelectedItem && setIsActionsVisible) {
            setSelectedItem(book);
            setIsActionsVisible(true);
        }
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openOnlineBook( book.onlineId, book ,dispatch, navigation)}
                delayLongPress={350}
                onLongPress={handleLongPress}
            >
                <Image
                    source={
                        book.imageUrl
                            ? { uri: book.imageUrl }
                            : require("../../../../assets/placeholder-cover.png")
                    }
                    style={styles.cardCover}
                    onError={() => {
                        /* fallback на placeholder */
                    }}
                />
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {book.title}
                </Text>
                <View style={styles.cardMetaRow}>
                    <View style={styles.dot} />
                    <Text style={styles.cardMetaText}>
                        {book.avgRating && book.avgRating.toFixed
                            ? book.avgRating.toFixed(1)
                            : book.avgRating || 0}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 16 * 2 - 12) / 2;

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 8,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    cardCover: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        marginBottom: 6,
    },
    cardMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2E8B57',
    },
    cardMetaText: {
        fontSize: 12,
        color: '#2E8B57',
        marginLeft: 6,
    },
})