package de.fabiani.estimabackend.modules.votes;

public enum VoteValue {
    ZERO(0),
    ONE(1),
    TWO(2),
    THREE(3),
    FIVE(5),
    EIGHT(8),
    THIRTEEN(13),
    TWENTY_ONE(21),
    THIRTY_FOUR(34),
    FIFTY_FIVE(55),
    EIGHTY_NINE(89);

    private final int value;

    VoteValue(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static VoteValue fromInt(int value) {
        for (VoteValue v : values()) {
            if (v.value == value) {
                return v;
            }
        }
        throw new IllegalArgumentException("Invalid vote value: " + value);
    }
}
